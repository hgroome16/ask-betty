(function(root){
'use strict';
const defaults={units:200,price:24,cogs:12,popupCost:500,popupUplift:30,supportCost:240,supportUplift:18,discountCost:50,discountUplift:50,discount:20,redemption:70,clicks:800,purchases:48,competitorPrice:26,competitorDiscount:10};
function calculate(input){
 const p={...defaults,...input};for(const [key,value]of Object.entries(p)){p[key]=Number(value);if(!Number.isFinite(p[key])||p[key]<0)throw Error('Enter a non-negative number for '+key+'.');}
 if(p.price===0)throw Error('Regular price must be greater than zero.');
 for(const key of ['discount','redemption','competitorDiscount'])if(p[key]>100)throw Error('Percentages must be between 0 and 100.');
 if(p.purchases>p.clicks)throw Error('Attributed purchases cannot exceed tracked clicks.');
 if(!Number.isInteger(p.clicks)||!Number.isInteger(p.purchases))throw Error('Clicks and attributed purchases must be whole numbers.');
 const baseRevenue=p.units*p.price,baseProfit=p.units*(p.price-p.cogs),competitor=p.competitorPrice*(1-p.competitorDiscount/100);
 const scenarios=[['Pop-up',p.popupUplift,p.popupCost,0],['Retailer support',p.supportUplift,p.supportCost,0],['Product discount',p.discountUplift,p.discountCost,p.discount/100*p.redemption/100]].map(([name,uplift,cost,discountShare])=>{
  const units=p.units*(1+uplift/100),effectivePrice=p.price*(1-discountShare),discountSpend=units*p.price*discountShare,revenue=units*effectivePrice,profit=revenue-units*p.cogs-cost,incrementalProfit=profit-baseProfit,investment=cost+discountSpend,margin=effectivePrice-p.cogs;
  const requiredUnits=margin>0?(baseProfit+cost)/margin:null;
  return {name,uplift,cost,units,effectivePrice,discountSpend,revenue,profit,incrementalRevenue:revenue-baseRevenue,incrementalProfit,investment,roi:investment>0?incrementalProfit/investment*100:null,breakEvenUplift:requiredUnits!==null&&p.units>0?Math.max(0,(requiredUnits/p.units-1)*100):null,priceGap:effectivePrice-competitor};
 });
 return {inputs:p,baseRevenue,baseProfit,competitor,scenarios,conversion:p.clicks>0?p.purchases/p.clicks*100:null,bestProfit:[...scenarios].sort((a,b)=>b.incrementalProfit-a.incrementalProfit)[0],bestROI:[...scenarios].filter(s=>s.roi!==null).sort((a,b)=>b.roi-a.roi)[0]||null};
}
const model={defaults,calculate};if(typeof module!=='undefined')module.exports=model;else root.BettyROI=model;
})(typeof window==='undefined'?{}:window);
