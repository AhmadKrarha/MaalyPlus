/**
 * MaalyPlus Scoring Algorithm v2.0
 * خوارزمية تقييم مالي بلس — نقاط من 100 لكل منتج مالي
 */
const MaalyPlusScore = (() => {

  function parseNum(val, def=0) {
    if (val===null||val===undefined||val==='') return def;
    const n=parseFloat(val); return isNaN(n)?def:n;
  }
  function norm(val,lo,hi,hb=true) {
    if(hi===lo) return 0.5;
    const n=(val-lo)/(hi-lo); return hb?n:1-n;
  }
  function clamp(val,lo=30,hi=97) { return Math.max(lo,Math.min(hi,Math.round(val))); }

  // البطاقة مجهولة الرسوم تُقيَّم بوسيط رسوم الفئة (لا صفراً) — عدالة تقييم
  function scoreCards(cards) {
    if(!cards||!cards.length) return [];
    const E = (typeof MP_CARD_ENGINE!=='undefined') ? MP_CARD_ENGINE
            : (typeof require!=='undefined' ? require('./cards/card-engine.js') : null);
    if(!E) throw new Error('MP_CARD_ENGINE غير محمَّل — حمِّل cards/card-engine.js قبل scoring.js');
    const R = E.score(cards);
    return cards.map((c,i)=>({...c, maalyplus_score:R[i].score, maalyplus_tag:getCardTag(c),
        score_breakdown:R[i].breakdown, score_status:R[i].status,
        score_inputs:R[i].inputs, score_coverage:R[i].coverage}))
      .sort((a,b)=>{ const A=a.maalyplus_score,B=b.maalyplus_score;
        if(A===null&&B===null) return 0; if(A===null) return 1; if(B===null) return -1; return B-A; });
  }

  function getCardTag(c) {
    const rwd=(c.rewards||'').toLowerCase();
    const fee=parseNum(c.annual_fee_jod,999);
    if(rwd==='cashback'&&fee===0)     return {text:'الأفضل للكاش باك',color:'#059669'};
    if(rwd==='cashback')              return {text:'كاش باك مميز',color:'#059669'};
    if(rwd==='miles'||c.travel_benefits) return {text:'الأفضل للسفر',color:'#1E40AF'};
    if(fee===0)                       return {text:'بدون رسوم سنوية',color:'#0369A1'};
    if(c.sharia_compliant)            return {text:'متوافقة مع الشريعة',color:'#D97706'};
    if(rwd==='points')                return {text:'نقاط ومكافآت',color:'#7C3AED'};
    return null;
  }

  // ══ تقييم التوفير ══
  function scoreSavings(accounts) {
    if(!accounts||!accounts.length) return [];
    const rates=accounts.map(a=>parseNum(a.annual_rate,0));
    const bals=accounts.map(a=>parseNum(a.min_balance_jod,0));
    const [minR,maxR]=[Math.min(...rates),Math.max(...rates)];
    const [minB,maxB]=[Math.min(...bals),Math.max(...bals)];
    const W={rate:0.35,fee:0.20,features:0.25,balance:0.20};
    return accounts.map(a=>{
      const rateScore=norm(parseNum(a.annual_rate,0),minR,maxR,true)*100;
      const feeScore=parseNum(a.monthly_fee_jod,0)===0?100:Math.max(0,100-parseNum(a.monthly_fee_jod,0)*10);
      const balScore=norm(parseNum(a.min_balance_jod,0),minB,maxB,false)*100;
      let feat=40;
      if(a.auto_save) feat+=18; if(a.digital_access) feat+=14;
      if(a.atm_access) feat+=12; if(a.withdrawal_limit==='غير محدود') feat+=16;
      feat=Math.min(feat,100);
      const total=clamp(rateScore*W.rate+feeScore*W.fee+feat*W.features+balScore*W.balance);
      return {...a,maalyplus_score:total,
        score_breakdown:{rate:Math.round(rateScore),fee:Math.round(feeScore),features:Math.round(feat),balance:Math.round(balScore)}};
    }).sort((a,b)=>b.maalyplus_score-a.maalyplus_score);
  }

  // ══ تقييم تأمين السيارة ══
  function scoreCarInsurance(cos) {
    if(!cos||!cos.length) return [];
    const prices=cos.map(c=>parseNum(c.comprehensive_from_jod,300));
    const deduc=cos.map(c=>parseNum(c.deductible_jod,150));
    const days=cos.map(c=>parseNum(c.claim_days,7));
    const [minP,maxP]=[Math.min(...prices),Math.max(...prices)];
    const [minD,maxD]=[Math.min(...deduc),Math.max(...deduc)];
    const [minDy,maxDy]=[Math.min(...days),Math.max(...days)];
    const W={price:0.25,deductible:0.30,coverage:0.30,speed:0.15};
    return cos.map(c=>{
      const priceScore=norm(parseNum(c.comprehensive_from_jod,300),minP,maxP,false)*100;
      const dedScore=norm(parseNum(c.deductible_jod,150),minD,maxD,false)*100;
      const daysScore=norm(parseNum(c.claim_days,7),minDy,maxDy,false)*100;
      let cov=30;
      if(c.covers_natural) cov+=15; if(c.covers_theft) cov+=15;
      if(c.covers_glass) cov+=10; if(c.roadside_assistance) cov+=15;
      if(c.digital_claims) cov+=15;
      cov=Math.min(cov,100);
      const total=clamp(priceScore*W.price+dedScore*W.deductible+cov*W.coverage+daysScore*W.speed);
      return {...c,maalyplus_score:total,
        score_breakdown:{price:Math.round(priceScore),deductible:Math.round(dedScore),coverage:Math.round(cov),speed:Math.round(daysScore)}};
    }).sort((a,b)=>b.maalyplus_score-a.maalyplus_score);
  }

  // ══ عرض ══
  function getLabel(score) {
    if(score>=85) return {text:'ممتاز',color:'#059669',bg:'#D1FAE5'};
    if(score>=72) return {text:'جيد جداً',color:'#1E40AF',bg:'#DBEAFE'};
    if(score>=58) return {text:'جيد',color:'#D97706',bg:'#FEF3C7'};
    return {text:'مقبول',color:'#6B7280',bg:'#F3F4F6'};
  }

  function renderBadge(score) {
    const l=getLabel(score);
    return `<span class="mp-score-badge" style="display:inline-flex;align-items:center;gap:4px;background:${l.bg};border-radius:50px;padding:3px 9px;font-size:.76rem;font-weight:700;color:${l.color};" title="نقاط مالي بلس: ${score}/100"><svg width="10" height="10" viewBox="0 0 24 24" fill="${l.color}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${score} — ${l.text}</span>`;
  }

  function renderBreakdown(bd, type) {
    const labels={
      cards:{rate:'الفائدة',fee:'الرسوم',features:'المزايا',access:'سهولة الوصول'},
      savings:{rate:'العائد',fee:'الرسوم',features:'المزايا',balance:'الرصيد الأدنى'},
      carIns:{price:'السعر',deductible:'الاستهلاك',coverage:'التغطية',speed:'سرعة التعويض'},
    };
    const ws={cards:{rate:30,fee:25,features:25,access:20},savings:{rate:35,fee:20,features:25,balance:20},carIns:{price:25,deductible:30,coverage:30,speed:15}};
    const lbls=labels[type]||{}; const w=ws[type]||{};
    return `<div style="padding:.6rem 0;font-size:.78rem;">
      <div style="color:#6B7280;margin-bottom:.6rem;font-weight:600;">📊 تفاصيل نقاط مالي بلس</div>
      ${Object.entries(bd).map(([k,v])=>`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <div style="min-width:115px;color:#374151;text-align:right">${lbls[k]||k}<span style="color:#9CA3AF;font-size:.7rem;"> (${w[k]||''}%)</span></div>
        <div style="flex:1;background:#E5E7EB;border-radius:50px;height:6px;overflow:hidden"><div style="width:${v}%;background:#10B981;height:100%;border-radius:50px;"></div></div>
        <div style="font-weight:700;color:#111;min-width:24px">${v}</div>
      </div>`).join('')}
    </div>`;
  }

  return { scoreCards, scoreSavings, scoreCarInsurance, getLabel, renderBadge, renderBreakdown };
})();
