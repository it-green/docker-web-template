import SweetScroll from 'sweet-scroll'

// スムーススクロールの設定
const scroller = new SweetScroll()

scroller.update({
  trigger: 'a[href^="#"]',
  duration: 600,
  easing: 'easeOutQuint',
  offset: 0,
  vertical: true,
  horizontal: false,
  cancellable: true,
  updateURL: false,
  preventDefault: true,
  stopPropagation: true,
})


console.log("hello world");
