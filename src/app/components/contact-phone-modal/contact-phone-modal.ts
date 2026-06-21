import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ContactSfxService, type ContactSfxKey } from '../../services/contact-sfx.service';

@Component({
  selector: 'app-contact-phone-modal',
  standalone: true,
  templateUrl: './contact-phone-modal.html',
  styleUrl: './contact-phone-modal.scss',
})
export class ContactPhoneModalComponent implements OnDestroy {
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly visible = computed(() => this.modalState() !== 'closed');

  private readonly modelPath = '/3d/contactPhone.glb';
  private readonly dracoDecoderPath = 'https://www.gstatic.com/draco/v1/decoders/';
  private readonly cameraFramingScale = 0.6;
  private readonly cameraVerticalOffsetFactor = 0.1;
  private readonly modelVerticalOffsetFactor = 0.3;
  private readonly randomIdleActionNames = ['button', 'ruedita', 'antena'];
  private readonly randomActionSfxDelayMs = 700;
  private readonly minRandomIdleDelayMs = 12000;
  private readonly maxRandomIdleDelayMs = 28000;
  private readonly modalState = signal<'closed' | 'open' | 'closing'>('closed');
  private readonly animationClock = new THREE.Clock();

  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private introAction: THREE.AnimationAction | null = null;
  private outroAction: THREE.AnimationAction | null = null;
  private idleAction: THREE.AnimationAction | null = null;
  private randomIdleActions: Array<{ action: THREE.AnimationAction; key: ContactSfxKey }> = [];
  private activeAction: THREE.AnimationAction | null = null;
  private frameRequestId: number | null = null;
  private randomIdleTimerId: ReturnType<typeof setTimeout> | null = null;
  private randomIdleSfxTimerId: ReturnType<typeof setTimeout> | null = null;
  private isInitializingScene = false;
  private pendingClose = false;

  private readonly onWindowResize = () => {
    this.resizeRenderer();
  };

  private readonly onAnimationFinished = (event: THREE.Event): void => {
    const finishedEvent = event as THREE.Event & { action?: THREE.AnimationAction };

    if (!finishedEvent.action) {
      return;
    }

    if (this.pendingClose && this.outroAction && finishedEvent.action === this.outroAction) {
      this.pendingClose = false;
      this.finishClosing();
      return;
    }

    if (this.pendingClose) {
      return;
    }

    if (this.introAction && finishedEvent.action === this.introAction) {
      this.startIdleLoop();
      this.scheduleRandomIdleAction();
      return;
    }

    if (this.randomIdleActions.some(({ action }) => action === finishedEvent.action)) {
      this.startIdleLoop();
      this.scheduleRandomIdleAction();
    }
  };

  @ViewChild('phoneModalStage') phoneModalStage?: ElementRef<HTMLDivElement>;

  constructor(
    private zone: NgZone,
    private contactSfxService: ContactSfxService,
  ) {}

  ngOnDestroy(): void {
    this.stopRenderLoop();
    this.disposeThreeScene();
    window.removeEventListener('resize', this.onWindowResize);
  }

  async open(): Promise<void> {
    if (this.modalState() === 'open') {
      return;
    }

    this.pendingClose = false;
    this.modalState.set('open');
    this.visibleChange.emit(true);

    await this.ensureThreeSceneInitialized();
    this.startRenderLoop();

    if (this.introAction) {
      this.playAction(this.introAction);
      return;
    }

    this.startIdleLoop();
    this.scheduleRandomIdleAction();
  }

  close(): void {
    if (this.modalState() === 'closed' || this.modalState() === 'closing') {
      return;
    }

    this.cancelRandomIdleTimer();
    this.cancelRandomIdleSfxTimer();

    if (!this.outroAction) {
      this.finishClosing();
      return;
    }

    this.modalState.set('closing');
    this.pendingClose = true;
    this.startRenderLoop();
    this.playAction(this.outroAction);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    this.close();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.visible()) {
      return;
    }

    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.close();
  }

  private async ensureThreeSceneInitialized(): Promise<void> {
    if (this.renderer || this.isInitializingScene) {
      return;
    }

    const stage = this.phoneModalStage?.nativeElement;
    if (!stage) {
      return;
    }

    this.isInitializingScene = true;

    try {
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(
        45,
        Math.max(stage.clientWidth, 1) / Math.max(stage.clientHeight, 1),
        0.1,
        100,
      );

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(Math.max(stage.clientWidth, 1), Math.max(stage.clientHeight, 1));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 10.0;
      this.renderer.setClearAlpha(0);
      stage.appendChild(this.renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 5, 4);
      const rim = new THREE.DirectionalLight(0x88aaff, 0.8);
      rim.position.set(-4, 2, -3);
      this.scene.add(ambient, key, rim);

      const gltf = await this.loadModelWithAnimations(this.modelPath);
      this.applyMetallicRoughness(gltf.scene);
      this.scene.add(gltf.scene);
      this.setupCameraForModel(gltf.scene);
      this.setupAnimations(gltf);

      window.addEventListener('resize', this.onWindowResize);
      this.resizeRenderer();
    } finally {
      this.isInitializingScene = false;
    }
  }

  private loadModelWithAnimations(path: string): Promise<GLTF> {
    return new Promise<GLTF>((resolve, reject) => {
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(this.dracoDecoderPath);
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        path,
        (gltf: GLTF) => {
          dracoLoader.dispose();
          resolve(gltf);
        },
        undefined,
        (error: unknown) => {
          dracoLoader.dispose();
          reject(error);
        },
      );
    });
  }

  private setupCameraForModel(model: THREE.Object3D): void {
    if (!this.camera) {
      return;
    }

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z, 0.001);

    model.position.sub(center);
    model.position.y += maxSize * this.modelVerticalOffsetFactor;

    const distance =
      (maxSize / (2 * Math.tan((Math.PI * this.camera.fov) / 360))) * this.cameraFramingScale;
    this.camera.position.set(0, maxSize * this.cameraVerticalOffsetFactor, distance);
    this.camera.near = Math.max(distance / 100, 0.01);
    this.camera.far = distance * 25;
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  private setupAnimations(gltf: GLTF): void {
    if (!gltf.animations.length) {
      return;
    }

    this.mixer = new THREE.AnimationMixer(gltf.scene);
    this.mixer.addEventListener('finished', this.onAnimationFinished);

    const introClip =
      gltf.animations.find((clip: THREE.AnimationClip) => clip.name.toLowerCase() === 'intro') ??
      gltf.animations.find((clip: THREE.AnimationClip) =>
        clip.name.toLowerCase().includes('intro'),
      ) ??
      gltf.animations[0];

    const outroClip =
      gltf.animations.find((clip: THREE.AnimationClip) => clip.name.toLowerCase() === 'outro') ??
      gltf.animations.find((clip: THREE.AnimationClip) =>
        clip.name.toLowerCase().includes('outro'),
      ) ??
      null;

    const idleClip =
      gltf.animations.find((clip: THREE.AnimationClip) => clip.name.toLowerCase() === 'idle') ??
      gltf.animations.find((clip: THREE.AnimationClip) =>
        clip.name.toLowerCase().includes('idle'),
      ) ??
      null;

    this.introAction = introClip ? this.mixer.clipAction(introClip) : null;
    this.outroAction = outroClip ? this.mixer.clipAction(outroClip) : null;
    this.idleAction = idleClip ? this.mixer.clipAction(idleClip) : null;

    const randomClips = this.randomIdleActionNames
      .map((name) => {
        const clip =
          gltf.animations.find(
            (candidate: THREE.AnimationClip) => candidate.name.toLowerCase() === name,
          ) ??
          gltf.animations.find((candidate: THREE.AnimationClip) =>
            candidate.name.toLowerCase().includes(name),
          );

        if (!clip) {
          return null;
        }

        const key = this.resolveRandomActionSfxKey(clip.name);
        if (!key) {
          return null;
        }

        return { clip, key };
      })
      .filter((entry): entry is { clip: THREE.AnimationClip; key: ContactSfxKey } =>
        Boolean(entry),
      );

    const uniqueRandomClips = randomClips.filter(
      (entry, index, all) =>
        all.findIndex((candidate) => candidate.clip.name === entry.clip.name) === index,
    );

    this.randomIdleActions = uniqueRandomClips
      .map(({ clip, key }) => ({ action: this.mixer!.clipAction(clip), key }))
      .filter(
        ({ action }) =>
          action !== this.introAction && action !== this.outroAction && action !== this.idleAction,
      );

    if (this.introAction) {
      this.introAction.setLoop(THREE.LoopOnce, 1);
      this.introAction.clampWhenFinished = true;
    }

    if (this.outroAction) {
      this.outroAction.setLoop(THREE.LoopOnce, 1);
      this.outroAction.clampWhenFinished = true;
    }

    if (this.idleAction) {
      this.idleAction.setLoop(THREE.LoopRepeat, Infinity);
      this.idleAction.clampWhenFinished = false;
    }

    this.randomIdleActions.forEach(({ action }) => {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    });
  }

  private playAction(action: THREE.AnimationAction | null): void {
    if (!action) {
      return;
    }

    if (this.activeAction && this.activeAction !== action) {
      this.activeAction.stop();
    }

    action.reset();
    action.enabled = true;
    action.play();
    this.activeAction = action;
  }

  private startRenderLoop(): void {
    if (this.frameRequestId !== null || !this.renderer || !this.scene || !this.camera) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const tick = () => {
        if (!this.renderer || !this.scene || !this.camera) {
          this.frameRequestId = null;
          return;
        }

        this.mixer?.update(this.animationClock.getDelta());
        this.renderer.render(this.scene, this.camera);
        this.frameRequestId = window.requestAnimationFrame(tick);
      };

      this.animationClock.start();
      tick();
    });
  }

  private stopRenderLoop(): void {
    if (this.frameRequestId !== null) {
      window.cancelAnimationFrame(this.frameRequestId);
      this.frameRequestId = null;
    }
  }

  private finishClosing(): void {
    this.modalState.set('closed');
    this.pendingClose = false;
    this.cancelRandomIdleTimer();
    this.cancelRandomIdleSfxTimer();
    this.activeAction = null;
    this.stopRenderLoop();
    this.visibleChange.emit(false);
  }

  private resizeRenderer(): void {
    if (!this.renderer || !this.camera) {
      return;
    }

    const stage = this.phoneModalStage?.nativeElement;
    if (!stage) {
      return;
    }

    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private disposeThreeScene(): void {
    this.cancelRandomIdleTimer();
    this.cancelRandomIdleSfxTimer();
    this.mixer?.removeEventListener('finished', this.onAnimationFinished);
    this.mixer = null;
    this.introAction = null;
    this.outroAction = null;
    this.idleAction = null;
    this.randomIdleActions = [];
    this.activeAction = null;

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
  }

  private applyMetallicRoughness(model: THREE.Object3D): void {
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(node.material) ? node.material : [node.material];

      materials.forEach((material) => {
        if (!material) {
          return;
        }

        const pbrMaterial = material as THREE.Material & {
          metalness?: number;
          roughness?: number;
        };

        if (typeof pbrMaterial.metalness === 'number') {
          pbrMaterial.metalness = 1.0;
        }

        if (typeof pbrMaterial.roughness === 'number') {
          pbrMaterial.roughness = 1.0;
        }

        pbrMaterial.needsUpdate = true;
      });
    });
  }

  private startIdleLoop(): void {
    if (!this.idleAction) {
      return;
    }

    this.playAction(this.idleAction);
  }

  private scheduleRandomIdleAction(): void {
    this.cancelRandomIdleTimer();

    if (this.modalState() !== 'open' || this.pendingClose || !this.randomIdleActions.length) {
      return;
    }

    this.randomIdleTimerId = setTimeout(() => {
      this.randomIdleTimerId = null;

      if (this.modalState() !== 'open' || this.pendingClose) {
        return;
      }

      const randomAction = this.getRandomIdleAction();
      this.playAction(randomAction.action);
      this.scheduleRandomIdleSfx(randomAction.key);
    }, this.getRandomIdleDelayMs());
  }

  private getRandomIdleAction(): { action: THREE.AnimationAction; key: ContactSfxKey } {
    const randomIndex = Math.floor(Math.random() * this.randomIdleActions.length);
    return this.randomIdleActions[randomIndex];
  }

  private getRandomIdleDelayMs(): number {
    const span = this.maxRandomIdleDelayMs - this.minRandomIdleDelayMs;
    return this.minRandomIdleDelayMs + Math.floor(Math.random() * (span + 1));
  }

  private cancelRandomIdleTimer(): void {
    if (this.randomIdleTimerId === null) {
      return;
    }

    clearTimeout(this.randomIdleTimerId);
    this.randomIdleTimerId = null;
  }

  private scheduleRandomIdleSfx(key: ContactSfxKey): void {
    this.cancelRandomIdleSfxTimer();

    this.randomIdleSfxTimerId = setTimeout(() => {
      this.randomIdleSfxTimerId = null;

      if (this.modalState() !== 'open' || this.pendingClose) {
        return;
      }

      this.contactSfxService.play(key);
    }, this.randomActionSfxDelayMs);
  }

  private cancelRandomIdleSfxTimer(): void {
    if (this.randomIdleSfxTimerId === null) {
      return;
    }

    clearTimeout(this.randomIdleSfxTimerId);
    this.randomIdleSfxTimerId = null;
  }

  private resolveRandomActionSfxKey(name: string): ContactSfxKey | null {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('button')) {
      return 'button';
    }

    if (normalizedName.includes('ruedita')) {
      return 'ruedita';
    }

    if (normalizedName.includes('antena') || normalizedName.includes('antenna')) {
      return 'antenna';
    }

    return null;
  }
}
