// Registro de modelos: decide si una pieza usa un modelo GLB específico
// (declarado en assets/models/manifest.json) o el modelo genérico procedural.
//
// Carga bajo demanda: el manifest se pide una sola vez y GLTFLoader solo se
// importa si el manifest declara al menos un archivo que se vaya a usar.
//
// Estado actual: el manifest está vacío, así que siempre se usan modelos
// genéricos. La ruta de carga GLB está preparada pero aún no se ha probado con
// un archivo real; debe verificarse cuando se incorpore el primer modelo.
let manifestPromise = null;

export function loadManifest(url) {
  if (!manifestPromise) {
    manifestPromise = fetch(url, { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : { models: [] }))
      .then(data => (Array.isArray(data?.models) ? data : { models: [] }))
      .catch(() => ({ models: [] }));
  }
  return manifestPromise;
}

// Busca un modelo específico por producto del catálogo; si no hay, null.
export async function findSpecificModel(manifestUrl, { productId, type }) {
  const { models } = await loadManifest(manifestUrl);
  return models.find(m => m.productId && m.productId === productId && m.type === type && typeof m.file === 'string') || null;
}

export async function loadGlb(baseUrl, entry) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(new URL(entry.file, baseUrl).href);
  const scene = gltf.scene;
  scene.traverse(o => { if (o.isMesh) { o.userData.ownsResources = true; o.userData.baseMaterial = o.material; } });
  scene.userData.labels = entry.labels || [];
  scene.userData.mounts = entry.mountPoints || {};
  return scene;
}
