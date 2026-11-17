"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Heart, Home as HomeIcon, MessageCircle, RotateCcw, Settings, Sparkles, X } from "lucide-react";

type Profile = { _id: string; name: string; age: number; photo: string; bio: string; location: string; interests: string[] };
type Match = Profile & { matchedAt: string };
type Tab = "home" | "discover" | "matches";
const API = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("discover");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [matchesError, setMatchesError] = useState("");
  const [swiping, setSwiping] = useState<"like" | "pass" | null>(null);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [offset, setOffset] = useState(0);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const startX = useRef<number | null>(null);
  const current = profiles[0];

  const loadFeed = useCallback(async () => {
    setLoading(true); setFeedError("");
    try { const response = await fetch(`${API}/feed`); if (!response.ok) throw new Error("Could not load profiles. Check that the API and MongoDB are running."); const data = await response.json(); setProfiles(data.profiles); }
    catch (e) { setFeedError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }, []);

  const loadMatches = useCallback(async () => {
    setMatchesError(""); setMatchesLoading(true);
    try { const response = await fetch(`${API}/matches`); if (!response.ok) throw new Error(); const data = await response.json(); setMatches(data.matches); }
    catch { setMatchesError("Could not load matches. Check that the API and MongoDB are running."); }
    finally { setMatchesLoading(false); }
  }, []);

  useEffect(() => { void loadFeed(); void loadMatches(); }, [loadFeed, loadMatches]);
  useEffect(() => { if (tab === "matches") void loadMatches(); }, [tab, loadMatches]);

  const swipe = async (direction: "like" | "pass") => {
    if (!current || swiping) return;
    setSwiping(direction); setOffset(direction === "like" ? 500 : -500); setFeedError("");
    try {
      const response = await fetch(`${API}/swipe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId: current._id, direction }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not save your swipe.");
      await new Promise((resolve) => setTimeout(resolve, 220)); setProfiles((items) => items.filter((item) => item._id !== current._id)); setSwiping(null); setOffset(0);
      if (data.match) { setMatched(data.matchedProfile); void loadMatches(); }
    } catch (e) { setSwiping(null); setOffset(0); setFeedError(e instanceof Error ? e.message : "Could not save your swipe."); }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => { startX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); };
  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => { if (startX.current === null) return; const delta = event.clientX - startX.current; startX.current = null; if (delta > 90) void swipe("like"); else if (delta < -90) void swipe("pass"); else setOffset(0); };

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setTab("discover")} aria-label="Coy home"><span className="brand-word">coy<span className="brand-dot">.</span></span></button>
      <div className="top-tabs" role="tablist" aria-label="Main navigation"><button className={tab === "home" ? "top-tab selected" : "top-tab"} onClick={() => setTab("home")}><HomeIcon size={16}/> Home</button><button className={tab === "discover" ? "top-tab selected" : "top-tab"} onClick={() => setTab("discover")}><Sparkles size={16}/> Discover</button></div>
      <div className="header-actions"><button className="matches-link" onClick={() => setTab("matches")}><Heart size={17} fill="currentColor"/><span>Matches</span><span className="match-count">{matches.length}</span></button><button className="settings-button" aria-label="Settings"><Settings size={20}/></button></div>
    </header>
    {tab === "home" ? <section className="blank-home" aria-label="Home tab"/> : tab === "matches" ? <section className="matches-page">
      <div className="page-heading"><div><span className="eyebrow">THE GOOD PART</span><h1>Your matches</h1><p>People who liked you back. A little mutual magic.</p></div><div className="heading-spark">✦</div></div>
      {matchesError ? <div className="matches-empty"><span className="empty-icon"><RotateCcw size={23}/></span><h2>Can’t load your matches</h2><p>{matchesError}</p><button className="primary-button" onClick={() => void loadMatches()}>Try again <RotateCcw size={15}/></button></div> : matchesLoading ? <div className="matches-empty"><span className="loader"/><p>Finding your mutual matches...</p></div> : matches.length ? <div className="match-grid">{matches.map((match) => <button className="match-card" key={match._id} onClick={() => setActiveMatch(match)}><img src={match.photo} alt=""/><span className="match-card-info"><strong>{match.name}, {match.age}</strong><small><span className="online-dot"/> It’s a mutual match</small></span><MessageCircle size={19}/></button>)}</div> : <div className="matches-empty"><span className="empty-icon"><Heart size={24}/></span><h2>Your story starts with a swipe</h2><p>When you and someone else like each other, you’ll find them here.</p><button className="primary-button" onClick={() => setTab("discover")}>Back to Discover <ArrowLeft size={16}/></button></div>}
    </section> : <section className="discover-page">
      <div className="discover-heading"><div><span className="eyebrow">A LITTLE CLOSER TO SOMETHING</span><h1>Discover</h1></div><button className="filter-button" aria-label="Discovery preferences"><span className="filter-dot"/><span>For you</span><ChevronDown size={15}/></button></div>
      <p className="demo-notice">Fan-made demo: profiles, bios, likes and matches are fictional—not real Coy accounts or endorsements.</p>
      <div className="discover-layout"><div className="card-column">
        {loading ? <div className="loading-card"><span className="loader"/><span>Finding your people...</span></div> : feedError ? <div className="empty-feed"><span className="empty-icon"><RotateCcw size={23}/></span><span className="eyebrow">JUST A MOMENT</span><h2>Can’t reach Discover</h2><p>{feedError}</p><button className="primary-button" onClick={() => void loadFeed()}>Try again <RotateCcw size={15}/></button></div> : current ? <>
          <article className={`profile-card ${swiping ? `exit-${swiping}` : ""}`} style={{ transform: `translateX(${offset}px) rotate(${offset / 24}deg)` }} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { startX.current = null; setOffset(0); }}>
            <img className="profile-photo" src={current.photo} alt={`${current.name}, ${current.age}`} draggable="false"/><div className="photo-shade"/><div className={`swipe-stamp ${offset > 60 ? "stamp-like" : offset < -60 ? "stamp-pass" : ""}`}>{offset > 60 ? "LIKE" : offset < -60 ? "PASS" : ""}</div>
            <div className="profile-content"><div className="profile-name-line"><h2>{current.name}<span>, {current.age}</span></h2><span className="verified" aria-label="Profile verified"><Check size={13}/></span></div><p className="profile-location">{current.location}</p><p className="profile-bio">{current.bio}</p><div className="interest-list">{current.interests.map((interest) => <span key={interest}>{interest}</span>)}</div></div><span className="photo-count"><span/> PROFILE</span>
          </article>
          <div className="swipe-controls"><button className="control-button pass-button" onClick={() => void swipe("pass")} disabled={!!swiping} aria-label="Pass"><X size={27}/></button><button className="undo-button" onClick={() => void loadFeed()} aria-label="Refresh profiles"><RotateCcw size={16}/></button><button className="control-button like-button" onClick={() => void swipe("like")} disabled={!!swiping} aria-label="Like"><Heart size={24} fill="currentColor"/></button></div><p className="swipe-hint">A spark? Swipe right <span>·</span> Not quite? Swipe left</p>
        </> : <div className="empty-feed"><span className="empty-icon"><Sparkles size={25}/></span><span className="eyebrow">THAT’S EVERYONE FOR NOW</span><h2>You’re all caught up</h2><p>You’ve met everyone in your feed. Check back soon for new faces.</p><button className="primary-button" onClick={() => void loadFeed()}>Refresh Discover <RotateCcw size={15}/></button></div>}
      </div><aside className="side-note"><div className="note-decoration">✳</div><span className="eyebrow">GOOD THINGS TAKE TWO</span><h3>Likes stay private.</h3><p>You’ll only know someone liked you when you both like each other. That’s the Coy promise. Profiles and match activity here are fictional demo data.</p><div className="note-divider"/><div className="note-stat"><span className="online-dot"/><span>Thoughtful connections, always</span></div></aside></div>
    </section>}
    <nav className="mobile-nav" aria-label="Mobile navigation"><button onClick={() => setTab("home")} className={tab === "home" ? "mobile-selected" : ""}><HomeIcon size={19}/><span>Home</span></button><button onClick={() => setTab("discover")} className={tab === "discover" ? "mobile-selected" : ""}><Sparkles size={19}/><span>Discover</span></button><button onClick={() => setTab("matches")} className={tab === "matches" ? "mobile-selected" : ""}><Heart size={19}/><span>Matches</span></button></nav>
    {matched && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="It’s a match"><div className="match-modal"><button className="modal-close" onClick={() => setMatched(null)} aria-label="Close match"><X size={18}/></button><div className="confetti">✦　✧　✦</div><span className="eyebrow">WELL, THIS IS NICE</span><h2>It’s a match!</h2><p>You and {matched.name} liked each other.</p><div className="match-portrait"><img src={matched.photo} alt=""/><span><Heart size={17} fill="currentColor"/></span></div><button className="primary-button" onClick={() => { setMatched(null); setTab("matches"); }}>See your matches <MessageCircle size={16}/></button><button className="text-button" onClick={() => setMatched(null)}>Keep discovering</button></div></div>}
    {activeMatch && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${activeMatch.name} match`}><div className="match-modal conversation-modal"><button className="modal-close" onClick={() => setActiveMatch(null)} aria-label="Close"><X size={18}/></button><div className="conversation-avatar"><img src={activeMatch.photo} alt=""/></div><span className="eyebrow">IT’S MUTUAL</span><h2>{activeMatch.name}, {activeMatch.age}</h2><p>{activeMatch.bio}</p><div className="conversation-placeholder"><MessageCircle size={19}/><span>Say hello when you’re ready.</span></div><button className="primary-button" onClick={() => setActiveMatch(null)}>Lovely, thanks <Check size={16}/></button></div></div>}
  </main>;
}
