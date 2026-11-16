'use client';
import { useState } from 'react';
export function ShareButton({text}:{text:string}){const [copied,setCopied]=useState(false);return <button className="primary" onClick={async()=>{const data={title:'Bibléva',text,url:location.href};if(navigator.share){try{await navigator.share(data)}catch{return}}else{await navigator.clipboard.writeText(`${text}\n${location.href}`);setCopied(true)}}}>{copied?'Lien copié':'Partager ce verset'}</button>}
