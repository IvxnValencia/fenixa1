// Exact-model facts with manufacturer sources. These do not certify BIOS/QVL support.
(() => {
  const specs = {
    'AMD Ryzen 5 8500G': {socket:'AM5', memory:'DDR5', source:'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8500g.html'},
    'AMD Ryzen 5 8600G': {socket:'AM5', memory:'DDR5', source:'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8600g.html'},
    'AMD Ryzen 7 5800XT': {socket:'AM4', memory:'DDR4', source:'https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800xt.html'},
    'Intel Core i3-12100F': {socket:'LGA1700', source:'https://www.intel.com/content/www/us/en/products/sku/132223/intel-core-i312100f-processor-12m-cache-up-to-4-30-ghz/specifications.html'},
    'Board ASRock H610M-HDV/M.2+ D5': {socket:'LGA1700',memory:'DDR5',checkedAt:'2026-10-01',source:'https://www.asrock.com/mb/Intel/H610M-HDVM.2%2b%20D5/index.asp#Specification'},
    'MSI B650M GAMING WIFI': {socket:'AM5', memory:'DDR5', source:'https://www.msi.com/Motherboard/B650M-GAMING-WIFI/Specification'},
    'MSI PRO B650M-A WIFI': {socket:'AM5', memory:'DDR5', source:'https://www.msi.com/Motherboard/PRO-B650M-A-WIFI/Specification'}
  };
  for (const p of window.FENIXA_CATALOG.products) if (specs[p.name]) p.platform = specs[p.name];
})();
