import { Component, type ReactNode } from 'react';
import { SAVE_KEY } from '../../game/save';
import { BrokenSaveScreen } from '../screens/BrokenSaveScreen';

/** Bozuk kayıt ekranı çökertirse oyuncuya yeni oyun seçeneği sunar. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; attempt: number }> {
  state = { failed: false, attempt: 0 };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  reset = () => {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      // depolama kapalı: yine de yeniden dene
    }
    this.setState((s) => ({ failed: false, attempt: s.attempt + 1 }));
  };
  render() {
    if (this.state.failed) return <BrokenSaveScreen onReset={this.reset} />;
    return <div key={this.state.attempt} style={{ display: 'contents' }}>{this.props.children}</div>;
  }
}
