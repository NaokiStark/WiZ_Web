from pywizlight import wizlight, PilotBuilder, discovery
from sqlalchemy.orm import Session

import repo

actual_scene_id = 11
actual_dim = 255

async def update_state(ip, db):
    try:
        bulb = wizlight(ip)
        bulb_state = await bulb.updateState()
        print(f"RESULT: {bulb_state.pilotResult}")
        if bulb_state:
            #print(bulb, bulb_state.pilotResult)
            repo.update_bulb_state(db, bulb.ip, bulb_state.get_state(), bulb_state.get_scene_id(),
                                 bulb_state.get_scene(), bulb_state.get_brightness())

    except Exception as error:
        print(f'Cannot get State {ip}: {error}')
        repo.update_bulb_down(db, ip)

    return repo.get_bulb(db, ip)


async def update_all_states(db):
    result_bulbs = []
    bulbs = repo.get_all_bulbs(db)
    for bulb in bulbs:
        result_bulbs.append(await update_state(bulb.ip, db))

    return result_bulbs


async def scan(db, ipAddressRange):
    # bulbs = await discovery.discover_lights(broadcast_space="192.168.1.255")    
    print(f"Scan IP address: {0}", ipAddressRange)
    
    bulbs = await discovery.discover_lights(ipAddressRange)
    for bulb in bulbs:
        print(bulb)
        repo.add_bulb(db, bulb.ip)

    return await update_all_states(db)


async def on(ip, db):
    try:
        bulb = wizlight(ip)        
        await bulb.turn_on(PilotBuilder(scene = actual_scene_id, brightness = actual_dim))
    except Exception as error:
        print(f'Cannot switch on {ip}: {error}')
        repo.update_bulb_down(db, ip)
        return repo.get_bulb(db, ip)

    return await update_state(ip, db)


async def off(ip, db):
    try:
        bulb = wizlight(ip)
        await bulb.turn_off()
    except Exception as error:
        print(f'Cannot switch off {ip}: {error}')
        repo.update_bulb_down(db, ip)
        return repo.get_bulb(db, ip)

    return await update_state(ip, db)


async def scene(ip, scene_id, db):
    try:
        bulb = wizlight(ip)
        actual_scene_id = scene_id
        await bulb.turn_on(PilotBuilder(scene = scene_id))
    except Exception as error:
        print(f'Cannot change {ip} to scene {scene_id}: {error}')
        repo.update_bulb_down(db, ip)
        return repo.get_bulb(db, ip)

    return await update_state(ip, db)

async def dim(ip, dimming, scene_id, db):
    try:
        bulb = wizlight(ip)
        await bulb.turn_on(PilotBuilder(scene = scene_id, brightness = dimming))
        actual_dim = dimming
        
    except Exception as error:
        print(f'Cannot change {ip} to dim {dimming}: {error}')
        repo.update_bulb_down(db, ip)
        return repo.get_bulb(db, ip)
    
    return await update_state(ip, db)