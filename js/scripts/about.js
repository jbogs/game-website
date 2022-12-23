/*

Key and door objective
Pick up a key to unlock door

*/

// Canvas properties
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.height = 1020
canvas.width = 1980
 
c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)


// Vars
const offset = {x: -1500, y: -1700} // Player starting position on map


// Media
const image = new Image()
image.src = '/media/images/maps/about/map.png'

const bridgeImage = new Image()
bridgeImage.src = '/media/images/maps/about/bridge.png'

const playerImage = new Image()
playerImage.src = '/media/images/sprites/characters/spritesheet.png'

const switchImage = new Image()
switchImage.src = '/media/images/sprites/misc/switch.png'

const foregroundImage = new Image()
foregroundImage.src = '/media/images/maps/portfolio/foregroundObjects.png'

const crystalImage = new Image()
crystalImage.src = '/media/images/sprites/crystals/blue-crystal.png'


// Sprites
const player = new Sprite({
    position: {
        // 192 x 86 character dimensions
        x: (canvas.width / 2 - playerImage.width / 3), // For centering char in middle of the screen
        y: (canvas.height / 2 - playerImage.height / 4)
    },
    image: playerImage,
    frames: {
        xmax: 3,
        ymax: 3.975
    },
    scale: 3.5
})


const switchh = new Sprite({
    image: switchImage,
    frames: {
        xmax: 3,
        ymax: 3.975
    },
    velocity: 20,
    scale: 4,
    stop: true
})




// has to be based on map offset in case we ever move plr spawn
// will probably use zone data for it to know where it is, then just use 
// manual data by printing the location of it after using zone data
const crystal = new Sprite({
    position: {
        x: (canvas.width / 2), // For centering char in middle of the screen
        y: (canvas.height / 2 - 128 / 2)
    },
    image: crystalImage,
    frames: {
        xmax: 3,
        ymax: 1
    },
    velocity: 40,
    scale: 3
})
crystal.moving = true


const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image,
})


const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})



// Classes
const input = new Input()
const draw = new Draw()
const boundaries = new Zone(greenData)
const switchZone = new Zone(switchData)
const crystalZone = new Zone(crystalData)

// Updated elements
const drawnElements = [background, switchZone, crystalZone, switchh, player, foreground, boundaries, crystal]
const moveableElements = [background, ...switchZone.zone, crystal, ...boundaries.zone, foreground]


function activateBridge() {
    const bridge = new Sprite({
        position: {
            x: background.position.x,
            y: background.position.y
        },
        image: bridgeImage
    })
    drawnElements.splice(1, 0, bridge)
    moveableElements.splice(1, 0, bridge)
    switchh.moving = true
}

switchh.position = switchZone.zone[0].position
crystal.position = crystalZone.zone[0].position
  
var activated = false
 
// Core loop
function animate() {
    const animationId = window.requestAnimationFrame(animate)

    // Initial
    draw.drawElements(drawnElements)
    player.moving = false
    
    // Movement
    if (input.getPressed(['w', 'a', 's', 'd'])) {
        // Update player sprite
        var key = input.lastKey
        player.frames.yval = input.keys[key].yval
        player.moving = true

        // Future position
        const speed = 3
        var x = (input.keys[key].positions.x * speed) || 0
        var y = (input.keys[key].positions.y * speed) || 0

        // Collision conditions
        if (boundaries.collision(x, y)) {
            console.log('collide')
            player.moving = false 
            return
        } 

        if (crystalZone.collision(x, y)) {
            uninit(animationId)
        }

        if (switchZone.collision()) {
            if (!activated) {
                activated = true
                activateBridge()
            }
        }

        draw.moveElements(moveableElements, x, y)
    }
}



// Setup and removal
function uninit(animationId) {
    window.cancelAnimationFrame(animationId)

    gsap.to('#inner', {
        opacity: 1,
        repeat: 3,
        yoyo: true,
        duration: 0.4,
        onComplete() {
            // solid black
            gsap.to('#inner', {
                opacity: 1,
                duration: 0.4,
                onComplete() {
                    localStorage.setItem('Portfolio', 'unlocked');
                    window.location.href = "/html/map.html"
                }
            })
        }
    })
}

function init() {
    // Init
    window.addEventListener('keydown', function(e) {
    input.keydown(e)
    })
    window.addEventListener('keyup', function(e) {
    input.keyup(e)
    })
    animate()
}

init()

