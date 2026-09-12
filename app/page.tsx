'use client';

import { useCallback, useRef, useState } from 'react';
import { synthesize, TtsError, SPACE_ID } from '@/lib/tts';

type Tab = 'studio' | 'research' | 'about' | 'install';

const TABS: { id: Tab; label: string }[] = [
  { id: 'studio', label: 'Voice studio' },
  { id: 'research', label: 'Research & use cases' },
  { id: 'about', label: 'About' },
  { id: 'install', label: 'Install app' },
];

const SAMPLES = [
  'আজকের meeting শুরু হবে সকাল ১০টায়। Please join on time!',
  'আপনার order confirm হয়েছে, delivery আগামী ৩ দিনের মধ্যে।',
  'আমি ভালো আছি, তুমি কেমন আছো?',
  'এই semester এ আমরা machine learning course টা নিচ্ছি।',
];

export default function Page() {
  const [tab, setTab] = useState<Tab>('studio');
  return (
    <div className="wrap">
      <Masthead />
      <Hero />
      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            className="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main>
        {tab === 'studio' && <StudioTab />}
        {tab === 'research' && <ResearchTab />}
        {tab === 'about' && <AboutTab />}
        {tab === 'install' && <InstallTab />}
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="crest" src="/logos/sust.png" alt="Shahjalal University of Science and Technology" />
        <div className="inst">
          <h1>SHAHJALAL UNIVERSITY OF SCIENCE &amp; TECHNOLOGY</h1>
          <p>Department of Computer Science &amp; Engineering · Sylhet, Bangladesh</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fair" src="/logos/fair.png" alt="Bangladesh Innovation Fair 2026" />
      </div>
      <div className="rule" />
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="glyphrow" aria-hidden="true">
        <span className="glyphtile a bn">অ</span>
        <span className="glyphtile b">A</span>
      </div>
      <p className="kicker">TWO LANGUAGES. ONE VOICE.</p>
      <h1 className="title">Borno Voice<span className="dot">.</span></h1>
      <div className="panel panel-accent" style={{ marginTop: 14 }}>
        <p className="kicker" style={{ marginBottom: 4 }}>WHAT IS THIS?</p>
        <h2>Borno Voice reads your writing out loud.</h2>
        <p className="lede">
          You type a sentence the way people in Bangladesh actually write it — Bangla with
          English mixed in — and it speaks the whole thing back in a natural human voice,
          in about a second.
        </p>
        <div className="chips">
          <span className="chip teal"><i />Works on mobile and web</span>
          <span className="chip terra"><i />Installs like an app</span>
          <span className="chip gold"><i />No signup needed</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Voice studio                                                        */
/* ------------------------------------------------------------------ */

function StudioTab() {
  const [text, setText] = useState(SAMPLES[0]);
  const [normalise, setNormalise] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ msg: string; hint?: string } | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [normalised, setNormalised] = useState<string | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const generate = useCallback(async () => {
    setError(null);
    setBusy(true);
    setAudio(null);
    setNormalised(null);
    try {
      const res = await synthesize(text, normalise);
      setAudio(res.audio);
      setNormalised(res.normalised);
      if (!playerRef.current) playerRef.current = new Audio();
      playerRef.current.src = res.audio;
      await playerRef.current.play().catch(() => {});
    } catch (err) {
      if (err instanceof TtsError) setError({ msg: err.message, hint: err.hint });
      else setError({ msg: 'Something went wrong while generating speech.' });
    } finally {
      setBusy(false);
    }
  }, [text, normalise]);

  return (
    <section className="stack">
      <div className="panel">
        <h2>Type anything — Bangla, English, or both</h2>
        <p className="muted small">
          Mix the two freely in one sentence. Numbers, dates and amounts are spoken the way a
          person would say them.
        </p>

        <div style={{ marginTop: 14 }}>
          <label className="field" htmlFor="studio-input">YOUR TEXT</label>
          <textarea
            id="studio-input"
            className="bn"
            rows={4}
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="আজকের meeting শুরু হবে সকাল ১০টায়।"
          />
          <div className="counter">{text.length} / 500</div>
        </div>

        <div style={{ marginTop: 6 }}>
          <p className="field">VOICE</p>
          <div className="segment" role="group" aria-label="Voice">
            <span className="seg on" aria-current="true">Female</span>
          </div>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={normalise}
            onChange={(e) => setNormalise(e.target.checked)}
          />
          <span>
            Code-mix normalisation
            <em>Cleans up mixed spelling and expands numbers before speaking. Recommended.</em>
          </span>
        </label>

        <div className="btnrow">
          <button className="btn btn-primary" onClick={generate} disabled={busy || !text.trim()}>
            {busy ? <span className="spinner" /> : '▶'} Generate speech
          </button>
          {audio && (
            <a className="btn btn-ghost" href={audio} download="borno-voice.wav">
              Download WAV
            </a>
          )}
        </div>

        {(audio || normalised) && (
          <div className="result">
            {normalised && (
              <>
                <h3>NORMALISED TEXT</h3>
                <div className="bn" style={{ fontSize: 17 }}>{normalised}</div>
              </>
            )}
            {audio && (
              <>
                <h3 style={{ marginTop: normalised ? 12 : 0 }}>GENERATED AUDIO</h3>
                <audio controls src={audio} />
              </>
            )}
          </div>
        )}

        {error && (
          <div className="error" style={{ marginTop: 14 }}>
            <strong>{error.msg}</strong>
            {error.hint && <span>{error.hint}</span>}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <p className="field">TRY A SAMPLE</p>
          <div className="stack" style={{ gap: 8 }}>
            {SAMPLES.map((s) => (
              <button key={s} className="sample bn" onClick={() => setText(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function ResearchTab() {
  return (
    <section className="stack">
      <div className="panel">
        <h2>The problem we solve</h2>
        <p>
          Every global text-to-speech engine breaks on real Bangladeshi sentences. It reads
          English words with a foreign accent, mangles Bangla numerals, and loses the rhythm of
          how people in this country actually talk. Borno Voice is trained on code-mixed speech
          from the start, so a sentence with English in the middle of it still sounds like one
          person speaking.
        </p>
        <div className="stats">
          <div className="stat"><b>11,931</b><span>text–audio pairs</span></div>
          <div className="stat"><b>18.15 h</b><span>speech corpus</span></div>
          <div className="stat"><b>3.80</b><span>mean PESQ score</span></div>
          <div className="stat"><b>1</b><span>trained voice</span></div>
        </div>
      </div>

      <div className="panel">
        <h2>How it works</h2>
        <div className="grid3" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="num">1</div>
            <h3>You type</h3>
            <p>Bangla, English or both, exactly as you would write it.</p>
          </div>
          <div className="card">
            <div className="num">2</div>
            <h3>The model speaks</h3>
            <p>A VITS neural voice trained at SUST on our own 18.15-hour corpus.</p>
          </div>
          <div className="card">
            <div className="num">3</div>
            <h3>You download</h3>
            <p>A ready WAV file you can publish anywhere, in about a second.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Where it gets used</h2>
        <div className="grid2" style={{ marginTop: 12 }}>
          <div className="card"><h3>Education</h3><p>Lessons full of English technical terms, voiced in Bangla for every classroom.</p></div>
          <div className="card"><h3>Public services</h3><p>Notices and helplines that speak the way citizens actually talk.</p></div>
          <div className="card"><h3>Content creators</h3><p>Preview and export a voiceover before publishing.</p></div>
          <div className="card"><h3>Accessibility</h3><p>Screen reading that respects how Bangla is really spoken.</p></div>
        </div>
      </div>
    </section>
  );
}

function AboutTab() {
  return (
    <section className="stack">
      <div className="panel">
        <h2>About this project</h2>
        <p>
          Borno Voice is a research project of the Department of Computer Science &amp;
          Engineering at Shahjalal University of Science &amp; Technology, Sylhet. It addresses
          code-mixed Bangla–English speech synthesis: the way Bangladeshis genuinely write and
          speak, rather than the clean single-language text most systems assume.
        </p>
        <p>
          The model is a VITS end-to-end system trained on a purpose-built corpus of 11,931
          text–audio pairs, totalling 18.15 hours of studio speech.
        </p>
        <div className="grid3" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="num">1</div>
            <h3>Supervisor</h3>
            <p>Prof. Dr. M. Shahidur Rahman, Department of CSE, SUST</p>
          </div>
          <div className="card">
            <div className="num">2</div>
            <h3>Speech model</h3>
            <p>VITS, served from Hugging Face Spaces ({SPACE_ID})</p>
          </div>
          <div className="card">
            <div className="num">3</div>
            <h3>Runs in the browser</h3>
            <p>A static app — nothing of what you type is stored anywhere.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstallTab() {
  return (
    <section className="stack">
      <div className="panel">
        <h2>Install it as an app</h2>
        <p className="muted">
          Borno Voice is a progressive web app, so it installs straight from the browser with no
          app store involved.
        </p>
        <div className="grid2" style={{ marginTop: 14 }}>
          <div className="card">
            <h3>On Android</h3>
            <p>Open the browser menu and choose &ldquo;Add to Home Screen&rdquo; or &ldquo;Install app&rdquo;.</p>
          </div>
          <div className="card">
            <h3>On iPhone or iPad</h3>
            <p>Tap the Share button in Safari, then &ldquo;Add to Home Screen&rdquo;.</p>
          </div>
          <div className="card">
            <h3>On a computer</h3>
            <p>Click the install icon in the address bar in Chrome or Edge.</p>
          </div>
          <div className="card">
            <h3>Offline</h3>
            <p>The interface keeps working without a connection. Generating speech still needs the network.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <strong>Supervisor · Prof. Dr. M. Shahidur Rahman</strong>
      <div>Department of Computer Science &amp; Engineering, Shahjalal University of Science &amp; Technology</div>
      <div>Showcased at Bangladesh Innovation Fair 2026 · Novo Theatre, Dhaka</div>
    </footer>
  );
}
