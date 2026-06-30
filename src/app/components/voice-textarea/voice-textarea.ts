import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';

type DictationStatus = 'idle' | 'listening' | 'paused';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
};

@Component({
  selector: 'app-voice-textarea',
  imports: [CommonModule],
  templateUrl: './voice-textarea.html',
  styles: ``,
})
export class VoiceTextarea {
  private readonly destroyRef = inject(DestroyRef);
  private recognition: SpeechRecognitionLike | null = null;

  readonly label = input('Descripción');
  readonly hint = input('');
  readonly value = input('');
  readonly placeholder = input('');
  readonly rows = input(5);
  readonly lang = input('es-CO');

  readonly valueChange = output<string>();
  readonly dictationError = output<string>();

  readonly dictationStatus = signal<DictationStatus>('idle');
  readonly dictationInterimText = signal('');
  readonly isSpeechSupported = signal(this.getSpeechRecognitionConstructor() !== null);

  constructor() {
    this.destroyRef.onDestroy(() => this.destroySpeechRecognition());
  }

  updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }

  startDictation(): void {
    const SpeechRecognition = this.getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      this.dictationError.emit('El dictado por voz no está disponible en este navegador.');
      return;
    }

    if (!this.recognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang();
      this.recognition.onresult = (event) => this.handleSpeechResult(event);
      this.recognition.onerror = (event) => {
        this.dictationError.emit(
          `No se pudo usar el micrófono${event.error ? `: ${event.error}` : '.'}`,
        );
        this.dictationStatus.set('idle');
      };
      this.recognition.onend = () => {
        if (this.dictationStatus() === 'listening') {
          this.dictationStatus.set('paused');
        }
      };
    }

    try {
      this.dictationInterimText.set('');
      this.dictationStatus.set('listening');
      this.recognition.start();
    } catch {
      this.dictationStatus.set('listening');
    }
  }

  pauseDictation(): void {
    if (this.dictationStatus() !== 'listening') return;

    this.dictationStatus.set('paused');
    this.dictationInterimText.set('');
    this.recognition?.stop();
  }

  stopDictation(): void {
    this.dictationStatus.set('idle');
    this.dictationInterimText.set('');
    this.recognition?.stop();
  }

  private handleSpeechResult(event: SpeechRecognitionEventLike): void {
    let finalText = '';
    let interimText = '';

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript ?? '';

      if (result.isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }

    if (finalText.trim()) {
      this.appendText(finalText);
    }

    this.dictationInterimText.set(interimText.trim());
  }

  private appendText(text: string): void {
    const current = this.value().trim();
    const addition = text.trim();

    if (!addition) return;

    this.valueChange.emit(current ? `${current} ${addition}` : addition);
  }

  private destroySpeechRecognition(): void {
    this.dictationStatus.set('idle');
    this.recognition?.abort();
    this.recognition = null;
  }

  private getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
    if (typeof window === 'undefined') return null;

    const speechWindow = window as SpeechWindow;

    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  }
}
