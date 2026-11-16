'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const key='biblea-cookie-choice-v1';
export function CookieConsent(){
 const [open,setOpen]=useState(false),[details,setDetails]=useState(false);
 useEffect(()=>{setOpen(!localStorage.getItem(key));const listener=()=>{setDetails(true);setOpen(true)};window.addEventListener('biblea:cookie-settings',listener);return()=>window.removeEventListener('biblea:cookie-settings',listener)},[]);
 function save(){localStorage.setItem(key,JSON.stringify({necessary:true,optional:false,updatedAt:new Date().toISOString()}));setOpen(false)}
 if(!open)return null;
 return <div className="cookie-panel" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-description"><div className="cookie-copy"><div className="eyebrow">Vos données, vos choix</div><h2 id="cookie-title">Cookies et fonctionnement de Biblea</h2><p id="cookie-description">Vous pouvez lire et rechercher dans les Évangiles sans compte. Biblea ne dépose actuellement aucun cookie publicitaire ni outil de mesure facultatif. Si vous créez un compte, des cookies de session seront nécessaires pour vous reconnaître et sécuriser votre connexion. Vos notes et lectures personnelles ne sont pas activées à ce stade.</p>{details&&<div className="cookie-details"><p><strong>Nécessaires :</strong> session de connexion si vous utilisez un compte et mémorisation locale de ce choix. Ils ne servent pas à la publicité.</p><p><strong>Facultatifs :</strong> aucun outil de suivi ou de personnalisation n’est activé actuellement. Si cela change, nous demanderons un nouveau choix.</p><p>Consultez la <Link href="/confidentialite">confidentialité</Link>, la page <Link href="/cookies">cookies</Link> et les <Link href="/conditions-utilisation">conditions d’utilisation</Link>.</p></div>}</div><div className="cookie-actions"><button className="secondary" onClick={()=>setDetails(!details)} aria-expanded={details}>{details?'Réduire':'Voir le détail'}</button><button className="primary" onClick={save}>J’ai compris</button></div></div>
}
export function CookieSettingsButton(){return <button className="footer-link" type="button" onClick={()=>window.dispatchEvent(new Event('biblea:cookie-settings'))}>Gérer les cookies</button>}
