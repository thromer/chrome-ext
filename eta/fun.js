// Very nice but there is something off ... shifted by 7 hours (stupid time conversion on maps part i think)

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep/39914235#39914235
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeUrl(timestamp) {
  // Beach => Seattle
  return `https://www.google.com/maps/preview/directions?authuser=0&hl=en&gl=us&pb=!1m6!1s7618+Andrews+Beach+Rd+NE%2C+Olympia%2C+WA+98516!2s0x5491a7157dd4c8b7%3A0x9a0450c3e15f18a0!3m2!3d47.1430326!4d-122.78930629999999!6e0!1m6!1s2557+9th+Ave+W%2C+Seattle%2C+WA+98119-2264%2C+USA!2s0x54901574c6b124c5%3A0xd7ac79f8f9f76c5b!3m2!3d47.642268699999995!4d-122.36925129999999!6e0!3m12!1m3!1d318054.93768711376!2d-122.50589974999997!3d47.353076449999996!2m3!1f0!2f0!3f0!3m2!1i618!2i706!4f13.1!6m27!1m1!18b1!2m3!5m1!6e2!20e3!6m14!4b1!23b1!26i1!27i1!41i2!45b1!49b1!67b1!74i150000!75b1!89b1!109b1!114b1!119b1!10b1!16b1!19m3!1e0!2e2!3j${timestamp}!8m1!1e0!15m4!1s75n0YLC2MMXb-wSWj4fQDQ!4m1!2i7295!7e81!20m0!27b1!28m0!40i563`
}

async function handleOne(t) {
  await sleep(1000)
  let url = makeUrl(t)
  let resp = await fetch(url)
  let x = await resp.text()
  let z = JSON.parse(x.substr(5,))[0][1][0][0]
  return [
    t,
    z[2][1],
    z[3][1],
    z[10][0][1],
    z[10][3][1],
    z[10][4][2],
    z[2][0],
    z[3][0],
    z[10][0][0],
    z[10][3][0],
    z[10][4][0],
    z[10][4][1]
  ].join(',')
}

async function doit(start, duration, step) {
  console.log('t,hdist,hshort,hlong,hshort,hrange,dist,short,long,short,low,high')
  for (let offset = 0; offset < duration; offset += step) {
    let row = await handleOne(start + offset)
    console.log(row)
  }
}

// Sunday
doit(1627196400, 3600, 900)
  .then(x => console.log("done!"))  // Sunday
  .then(x => doit(1627023600, 86400, 900))  // Friday
  .then(x => console.log("done!"))
