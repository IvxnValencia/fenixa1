// Registra solo ofertas comprobadas manualmente para el MPN de la ficha.
// Envío e impuestos están en la moneda de la oferta. Usa null si se desconocen.
window.FENIXA_STORES = [
  {id:'amazon', name:'Amazon', country:'US', currency:'USD', shipsToCO:null, shippingModel:'per-item', url:'https://www.amazon.com/'},
  {id:'ebay', name:'eBay', country:'US', currency:'USD', shipsToCO:null, shippingModel:'per-item', url:'https://www.ebay.com/'},
  {id:'newegg', name:'Newegg', country:'US', currency:'USD', shipsToCO:null, shippingModel:'per-item', url:'https://www.newegg.com/'},
  {id:'speedlogic', name:'Speed Logic', country:'CO', currency:'COP', shipsToCO:null, shippingModel:'per-order', url:'https://speedlogic.com.co/'},
  {id:'clones', name:'Clones y Periféricos', country:'CO', currency:'COP', shipsToCO:null, shippingModel:'per-order', url:'https://clonesyperifericos.com/'},
  {id:'mercadolibre', name:'Mercado Libre', country:'CO', currency:'COP', shipsToCO:true, shippingModel:'per-item', url:'https://www.mercadolibre.com.co/'}
];

window.FENIXA_FX = {
  USD_COP: 3309.55,
  source: 'https://www.datos.gov.co/resource/32sa-8pi3.json (TRM oficial, vigente 18/11/2026)',
  checkedAt: '2026-11-18'
};

window.FENIXA_STORE_OFFERS = {};
