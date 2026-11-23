// Inline in the root layout's head, before the first paint (DESIGN.md, "Motion": view transitions). Two jobs for the
// cross-document view transition between Play (or the home page) and a game, both only while a transition runs:
//
// 1. Name only the mark that travels. A list of cards marks each drawing with data-vt-name; the one whose link is being
//    followed (pageswap), or the one the visitor is coming back from (pagereveal), gets that view-transition-name. Named
//    all at once, every card's drawing would fade out on its own layer above the new page.
// 2. Show the page in time. Every page is streamed behind app/loading.tsx, and React swaps the streamed page in one
//    animation frame after the HTML is parsed ($RC hands the swap to requestAnimationFrame), so the transition's picture
//    of the new page would be the loader. When a transition is about to take that picture, run React's own swap now
//    ($RV over its queue $RB). If React renames these, this does nothing and the page crossfades as before.
export const VIEW_TRANSITION_SCRIPT = `(function(){function name(u){try{var p=new URL(u,location.href).pathname,m=document.querySelector('a[href="'+p+'"] [data-vt-name]');if(m)m.style.viewTransitionName=m.getAttribute("data-vt-name")}catch(x){}}addEventListener("pageswap",function(e){if(e.viewTransition&&e.activation&&e.activation.entry)name(e.activation.entry.url)});addEventListener("pagereveal",function(e){if(!e.viewTransition)return;try{var w=window;if(w.$RB&&w.$RB.length&&typeof w.$RV==="function")w.$RV(w.$RB);var a=w.navigation&&w.navigation.activation;if(a&&a.from)name(a.from.url)}catch(x){}})})()`;
