export const getDevicePerformance = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return 'low';
  
  const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
  
  if (renderer.includes('Intel HD Graphics') && (renderer.includes('2000') || renderer.includes('3000'))) {
    return 'low';
  }
  if (renderer.includes('Intel') || renderer.includes('integrated')) {
    return 'medium';
  }
  
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 2) {
    return 'low';
  }
  
  return 'medium';
};