import React, { useEffect, useState } from "react";
import { Button, Container, Table, Spinner, Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Input, Badge } from "reactstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Tooltip } from 'react-tooltip'


import {
  Lightbulb,
  LightbulbFill,
  LightbulbOffFill,
  Recycle,
  TreeFill,
  Fire,
  SunFill,
  MoonFill,
  TrashFill,
} from "react-bootstrap-icons";

const BulbList = () => {
  const [bulbs, setBulbs] = useState([]);
  const [loading, setLoading] = useState(false);

  const light_modes = [
    "Ocean",
    "Romance",
    "Sunset",
    "Party",
    "Fireplace",
    "Cozy",
    "Forest",
    "Pastel Colors",
    "Wake up",
    "Bedtime",
    "Warm White",
    "Daylight",
    "Cool white",
    "Night light",
    "Focus",
    "Relax",
    "True colors",
    "TV time",
    "Plantgrowth",
    "Spring",
    "Summer",
    "Fall",
    "Deepdive",
    "Jungle",
    "Mojito",
    "Club",
    "Christmas",
    "Halloween",
    "Candlelight",
    "Golden white",
    "Pulse",
    "Steampunk",
  ];

  useEffect(() => {
    setLoading(true);
    fetch("/crud/bulbs")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Load: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(`${data.error}`);
        }
        setBulbs(data.bulbs);
      })
      .catch((error) => {
        console.log(error);
        toast.error(`${error}`);
      });
    setLoading(false);
  }, []);

  const scan = async () => {
    setLoading(true);
    await fetch("/wiz/scan")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Scan: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(`${data.error}`);
        }
        setBulbs(data.bulbs);
      })
      .catch((error) => {
        console.log(error);
        toast.error(`${error}`);
      });
    setLoading(false);
  };

  const bulbAction = async (event, url) => {
    const currentTarget = event.currentTarget;
    //    currentTarget.disabled = true;
    await fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Action: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("action", data);
        if (data.error) {
          throw new Error(`${data.error}`);
        }
        const updatedMap = new Map(data.bulbs.map((bulb) => [bulb.ip, bulb]));
        const updatedBulbs = bulbs.map((bulb) => {
          if (updatedMap.has(bulb.ip)) {
            const updatedBulb = updatedMap.get(bulb.ip);
            if (updatedBulb.state < 0) {
              toast.error(`'${updatedBulb.name}' is down`);
            }
            return updatedBulb;
          }
          return bulb;
        });
        if (!url.includes('dimm')) {
          setBulbs(updatedBulbs);
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(`${error}`);
      });
    //   currentTarget.disabled = false;
  };

  const bulbOn = async (event, ip) => {
    await bulbAction(event, `/wiz/on/${ip}`);
  };

  const bulbOff = async (event, ip) => {
    await bulbAction(event, `/wiz/off/${ip}`);
  };

  const bulbScene = async (event, ip, sceneId) => {
    await bulbAction(event, `/wiz/scene/${ip}/${sceneId}`);
  };
  const bulbDimm = async (event, ip, dimm) => {
    await bulbAction(event, `/wiz/dimm/${ip}/${dimm}`);
  };

  const deleteBulb = (bulb) => {
    if (window.confirm(`Delete '${bulb.name}'?`)) {
      fetch(`/crud/bulbs/${bulb.ip}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Cannot delete Bulb ${bulb.name}: ${response.status} ${response.statusText}`
            );
          }
          let updatedBulbs = [...bulbs].filter((i) => i.ip !== bulb.ip);
          setBulbs(updatedBulbs);
        })
        .catch((error) => {
          console.log(error);
          toast.error(`${error}`);
        });
    }
  };

  const changeName = (bulb) => {
    let name = prompt(`Name of bulb ${bulb.ip}?`, `${bulb.name}`);
    if (name != null && name.trim().length > 0) {
      bulb.name = name.trim();
      fetch(`/crud/bulbs/${bulb.ip}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulb),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Cannot update Bulb ${bulb.name}: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          const updatedMap = new Map(data.bulbs.map((bulb) => [bulb.ip, bulb]));
          const updatedBulbs = bulbs.map((bulb) =>
            updatedMap.has(bulb.ip) ? updatedMap.get(bulb.ip) : bulb
          );
          setBulbs(updatedBulbs);
        })
        .catch((error) => {
          console.log(error);
          toast.error(`${error}`);
        });
    }
  };

  if (loading) {
    return (
      <Spinner className="m-2 float-end" color="primary">
        Loading...
      </Spinner>
    );
  }

  const ModeDropDown = (bulb) => {
    let [dropdownOpen, setDropdownOpen] = useState(false);
    let dropdownToggle = () => setDropdownOpen((prevState) => !prevState);
    let mode_list = light_modes.map((mode, index) => {
      return (
        <DropdownItem key={bulb.bulb + mode}
          onClick={(event) => { bulbScene(event, bulb.bulb, index + 1) }}
        >{mode}</DropdownItem>
      );
    });
    return (
      <Dropdown direction="down" isOpen={dropdownOpen} toggle={dropdownToggle}>
        <DropdownToggle caret
          data-tooltip-id="rtooltip"
          data-tooltip-content="All Wiz Modes">All modes</DropdownToggle>
        <DropdownMenu>
          {mode_list}
        </DropdownMenu>
      </Dropdown>
    );
  }

  const DimmingDropDown = (bulb,) => {
    let [dim, changeDim] = useState(bulb.initialValue);
    let setDim = (state) => changeDim(state);

    let updateDim = (e, bublb, value) => {
      bulbDimm(e, bublb, value);
    }

    return (
      <div>
        <Input
          bsSize="sm"
          type="range"
          onChange={(e) => { setDim(e.target.value) }}
          onMouseUp={(e) => { updateDim(e, bulb.bulb.ip, e.target.value) }}
          min="0"
          max="255"
          step="1"
          value={dim}
          data-tooltip-id="rtooltip"
          data-tooltip-content="Brightness"
        />
        <span> {parseInt(dim / 255 * 100)}%</span>
      </div>
    )
  }

  const ColorPicker = (bublb) => {

    let [color, changeColor] = useState("#000000");
    let setColor = (state) => changeColor(state);

    let updateColor = (e, bublb, value) => {
      //bulbDimm(e, bublb, value);
      alert(`Not implemented yet. ${JSON.stringify(value)}`);
    }

    let hexTorgb = (hex) => {
      return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
    };

    return (
      <Input
        id="ColorPicker"
        name="color"
        placeholder="Color"
        type="color"
        value={color}
        data-tooltip-id="rtooltip"
        data-tooltip-content="Pick a color"
        onChange={(e) => setColor(e.target.value)}
        onBlur={(e) => updateColor(e, bublb.bulb.ip, hexTorgb(e.target.value))}
      />
    );
  }


  const bulbList = bulbs.map((bulb) => {
    let button;

    if (bulb.state < 0) {
      button = (
        <Button
          className="m-1"
          color="secondary"
          onClick={(event) => bulbOn(event, bulb.ip)}
          data-tooltip-id="rtooltip"
          data-tooltip-content="Turn On"
        >
          <LightbulbOffFill />
        </Button>
      );
    } else if (bulb.state === 0) {
      button = (
        <Button
          className="m-1"
          color="danger"
          onClick={(event) => bulbOn(event, bulb.ip)}
          data-tooltip-id="rtooltip"
          data-tooltip-content="Turn On"
        >
          <Lightbulb />
        </Button>
      );
    } else {
      button = (
        <>
          <Button
            className="m-1"
            color="success"
            onClick={(event) => bulbOff(event, bulb.ip)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Turn Off"
          >
            <LightbulbFill />
          </Button>
          <Badge color="dark">
            {bulb.scene}
          </Badge>
        </>
      );
    }

    return (
      <tr key={bulb.ip}>
        <td style={{ whiteSpace: "nowrap" }}>
          <b>
            <Link
              style={{ textDecoration: "none" }}
              onClick={() => changeName(bulb)}
            >
              {bulb.name}
            </Link>
          </b>
          {bulb.ip !== bulb.name && <div>{bulb.ip}</div>}
        </td>
        <td>{button}</td>
        <td>
          <Button
            className="m-1"
            color="primary"
            onClick={(event) => bulbScene(event, bulb.ip, 4)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Party 🪩"
          >
            🪩
            {/*<Recycle />*/}
          </Button>
          <Button
            className="m-1"
            color="success"
            onClick={(event) => bulbScene(event, bulb.ip, 27)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Christmas 🎄"
          >
            <TreeFill />
          </Button>
          <Button
            className="m-1"
            color="warning"
            onClick={(event) => bulbScene(event, bulb.ip, 5)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Fireplace 🔥"
          >
            <Fire />
          </Button>
          <Button
            className="m-1"
            color="warning"
            onClick={(event) => bulbScene(event, bulb.ip, 11)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Warm white 💡"
          >
            <LightbulbFill />
          </Button>
          <Button
            className="m-1"
            color="light"
            onClick={(event) => bulbScene(event, bulb.ip, 12)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Daylight ☀️"
          >
            <SunFill />
          </Button>
          <Button
            className="m-1"
            color="dark"
            onClick={(event) => bulbScene(event, bulb.ip, 14)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Night light 🌙"
          >
            <MoonFill />
          </Button>
          <Button
            className="m-1"
            color="danger"
            onClick={() => deleteBulb(bulb)}
            data-tooltip-id="rtooltip"
            data-tooltip-content="Delete Lightbulb"
          >
            <TrashFill />
          </Button>
        </td>
        <td>
          <ModeDropDown bulb={bulb.ip}></ModeDropDown>
          <DimmingDropDown bulb={bulb} initialValue={bulb.dimming}></DimmingDropDown>
          <ColorPicker bulb={bulb}></ColorPicker>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <Container fluid>
        <div className="float-end">
          <Button className="my-2" color="success" onClick={() => scan()}>
            Scan
          </Button>
        </div>
        <h3 className="text-center m-2">WiZ Smart LED App</h3>
        <Table className="mt-4">
          <thead>
            <tr className="table-dark">
              <th><LightbulbFill /> Lamp</th>
              <th>
                <Button
                  className="m-1"
                  color="success"
                  onClick={(event) => bulbOn(event, "all")}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Turn all On"
                >
                  <LightbulbFill />
                </Button>
                <Button
                  className="m-1"
                  color="danger"
                  onClick={(event) => bulbOff(event, "all")}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Turn all Off"
                >
                  <Lightbulb />
                </Button>
              </th>
              <th>
                <Button
                  className="m-1"
                  color="primary"
                  onClick={(event) => bulbScene(event, "all", 4)}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Party! 🪩"
                >
                  🪩
                  {/*<Recycle />*/}
                </Button>
                <Button
                  className="m-1"
                  color="success"
                  onClick={(event) => bulbScene(event, "all", 27)}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Christmas 🎄"
                >
                  <TreeFill />
                </Button>
                <Button
                  className="m-1"
                  color="warning"
                  onClick={(event) => bulbScene(event, "all", 5)}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Fireplace 🔥"
                >
                  <Fire />
                </Button>
                <Button
                  className="m-1"
                  color="warning"
                  onClick={(event) => bulbScene(event, "all", 11)}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Warm white 💡"
                >
                  <LightbulbFill />
                </Button>
                <Button
                  className="m-1"
                  color="light"
                  onClick={(event) => bulbScene(event, "all", 12)}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Daylight ☀️"
                >
                  <SunFill />
                </Button>
                <Button
                  className="m-1"
                  color="dark"
                  onClick={(event) => bulbScene(event, "all", 14)}
                  data-tooltip-id="rtooltip"
                  data-tooltip-content="Night light 🌙"
                >
                  <MoonFill />
                </Button>
              </th>
              <th>
                More ✨
              </th>
            </tr>
          </thead>
          <tbody>{bulbList}</tbody>
        </Table>
      </Container>
      <Tooltip id="rtooltip" border="1px solid #f0f0f0" />
    </div>
  );
};

export default BulbList;
