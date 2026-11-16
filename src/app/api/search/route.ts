import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/features/search/search';
export function GET(request:NextRequest){const query=request.nextUrl.searchParams.get('q')?.trim().slice(0,160);if(!query)return NextResponse.json({error:'Paramètre q requis'},{status:400});return NextResponse.json({query,results:search(query,20)},{headers:{'Cache-Control':'public, max-age=60'}});}
