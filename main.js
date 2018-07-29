const R = require('ramda')
const parse = require('csv-parse/lib/sync')
const moment = require('moment')

fs = require('fs');

let inputStr = fs.readFileSync('./tasks.csv', 'utf8')
let input = parse(inputStr, {columns: true, skip_empty_lines: true, skip_lines_with_empty_values: true})

// 算重要程度
const imp = R.map((t) => {
  t.imp =
    t.impMe * 3
    + t.impFamily * 3
    + t.impContract * 1.5
    + t.impOffice * 2
    + t.impOthers * 0.5
    + t.isGoal * 5
  t.imp = t.imp / 10 * 2
  return t
})

// 算緊急程度
const rush = R.map((t) => {
  let d = moment(new Date(t.deadline)).diff(new Date(), 'days')
  let rush = 10 - d
  if (rush < 1 || isNaN(rush)) {
    rush = 0
  }
  t.rush = rush
  return t
})


// 算出各總不同面向的 Priority
const P = R.map((t) => {
  t.p = (t.rush * 1 + t.imp * 3) / 4 * 2
  t.pFocus = (t.p * 1 + (t.focus * 2) * 2) / 3
  t.pCoffee = t.pFocus
  t.pNoFocus = (t.p * 1 + ((1 - t.focus) * 2) * 2) / 3
  t.pRush = (t.rush * 3 + t.imp * 1) / 4 * 2
  t.pHome = (t.p * 1 + t.onlyHome * 10) / 2
  t.pNoTime = ((t.effort <= 1) * 8 + t.pRush * 2 ) / 10
  return t
})


// 算出是否該 dedicate 給他人
const dedicate = R.map((t) => {
  t.dedicate = t.onlyMe * 7 + t.goodAt * 3
  t.dedicate = 10 - (t.dedicate / 10 * 2)
  t.dedicate = (t.p * 2 + t.dedicate * 8 ) / 10
  return t
})

// 將各個參數計算出來
const init = R.compose(dedicate, P, rush, imp)


// 排序
const s = (sort) => {
  return R.compose(R.sortWith([R.descend(R.prop(sort))]), init)
}


// 上午 2hr 專心時間
// tasks = s('pCoffee')(input)

// 捷運上
// tasks = s('pNoTime')(input)

// 在家
// tasks = s('pHome')(input)

// 公司下午, 雜事太多無法專心時
// tasks = s('pNoFocus')(input)

// 重要先決
// tasks = s('p')(input)

// 緊急先決
// tasks = s('pRush')(input)

// 抓出應該要請別人做的工作
// tasks = s('dedicate')(input)


console.log(tasks)
