
/** 是否是触摸设备 手机|平板 */
export const isTouchDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  window.navigator.userAgent
);

/** 是否是iOS */
export const isIOS = window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

export default null;
