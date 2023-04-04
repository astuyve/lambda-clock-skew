import { NtpTimeSync } from 'ntp-time-sync'
const timeSync = NtpTimeSync.getInstance()
const coldStartSystemTime = new Date()

let coldStartDate

let wrappedTime = await timeSync.getTime()

coldStartDate = wrappedTime.now

let functionDidColdStart = true

let isColdStartSet = false

/**
 * Use global variables to determine whether the container cold started
 * On the first container run, isColdStartSet and functionDidColdStart are true
 * For subsequent executions isColdStartSet will be true and functionDidColdStart will be false
 */
function setColdStart() {
  functionDidColdStart = !isColdStartSet
  isColdStartSet = true
}

async function delay(time) {
  return new Promise(res => setTimeout(res, time))
}

export async function handler(event) {
  setColdStart()
  if(functionDidColdStart) {
    const handlerWrappedTime = await timeSync.getTime()
    const invocationDate = handlerWrappedTime.now

    console.log(`\n[ASTUYVE] Current time from pool.ntp.org in handler: ${invocationDate}.\nSystem time is ${new Date()}. \nInit timestamp from pool.ntp.org: ${coldStartDate}. \nInit timestamp from system was: ${coldStartSystemTime}`)
  }
  await delay(500)
  return
}
