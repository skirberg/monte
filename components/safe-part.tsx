"use client";

import * as React from "react";
import { track } from "@vercel/analytics";

type Props = { name: string; children: React.ReactNode };

/**
 * Keeps one broken lab, game or tool from taking the whole page down. The rest of the page stays usable,
 * the reader gets a way to retry, and the error is counted (by name only) so it can be found and fixed.
 */
export class SafePart extends React.Component<Props, { failed: boolean; tries: number }> {
  state = { failed: false, tries: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    track("Part crashed", { part: this.props.name, error: String(error?.message ?? error).slice(0, 120) });
  }

  render() {
    if (!this.state.failed) return <React.Fragment key={this.state.tries}>{this.props.children}</React.Fragment>;
    return (
      <div role="alert" className="grid justify-items-start gap-3 rounded-[18px] border border-line bg-sand p-5 md:p-6">
        <p className="font-medium">The {this.props.name} stopped working.</p>
        <p className="text-sm text-ink-muted">The rest of the page is fine. Your saved progress is safe.</p>
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-ink/85"
          onClick={() => this.setState((s) => ({ failed: false, tries: s.tries + 1 }))}
        >
          Try again
        </button>
      </div>
    );
  }
}
