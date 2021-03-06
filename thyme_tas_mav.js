/**
 * Created by Il Yeup, Ahn in KETI on 2020-07-21.
 */

/**
 * Copyright (c) 2020, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

    // for TAS
var net = require('net');
var ip = require('ip');
var moment = require('moment');

var mavlink = require('./mavlibrary/mavlink.js');

const keycode = {

}

const map = new Map();
map.set(2, 'arm');
map.set(3, 'takeoff');
map.set(4, 'land');
map.set(5, 'altitude_hold');
map.set(11, 'disarm');
map.set(17, 'throttle_high');
map.set(30, 'yaw_left');
map.set(31, 'throttle_low');
map.set(32, 'yaw_right');
map.set(61000, 'pitch_forward');
map.set(61003, 'roll_left');
map.set(61008, 'pitch_backward');
map.set(61005, 'roll_right');

const throttle_max = 1638;
const throttle_min = 1438;
const throttle_neutral = 1505
var throttle_val = throttle_neutral;

const yaw_max = 1638;
const yaw_min = 1438;
const yaw_neutral = 1505
var yaw_val = yaw_neutral;

const pitch_max = 1638;
const pitch_min = 1438;
const pitch_neutral = 1505
var pitch_val = pitch_neutral;

const roll_max = 1638;
const roll_min = 1438;
const roll_neutral = 1505
var roll_val = roll_neutral;


// const readline = require('readline');
//
// readline.emitKeypressEvents(process.stdin);
// if (process.stdin.setRawMode){
//     process.stdin.setRawMode(true);
// }
//
// // process.stdin.on('keypress', (key, data) => {
// //     if (data.ctrl && data.name.toLowerCase() === 'c') {
// //         process.exit();
// //     } else {
// //         console.log('key', key);
// //         console.log('data', data);
// //     }
// // });
// // console.log('Press a key');
//
//
//
// //console.log('Use the following key mappings or press ctrl-t to exit:')
// for (const [key, value] of map.entries()) {
//     console.log(`${key} = ${value}`);
// }
//
// function key_listener(key, data) {
//     // console.log(key);
//     // console.log(data);
//
//     if (data.ctrl && data.name === 'c') {
//         process.exit();
//     }
//     else if(data.meta) {
//         if (map.has(data.name)) {
//             const command = map.get(data.name);
//
//             console.log(command);
//             // const result = getWeatherData(city, function (result) {
//             //     console.log(result);
//             // });
//         }
//         else {
//             console.log(`"${data.name} is not defined as a key mapping.`);
//         }
//     }
//     else {
//         if (map.has(data.name)) {
//             const command = map.get(data.name);
//
//             console.log(command + ': ' + throttle_val);
//
//             if(command === 'throttle_high') {
//                 throttle_val++;
//                 if(throttle_val >= throttle_max) {
//                     throttle_val = throttle_max;
//                 }
//             }
//         }
//         else {
//             console.log(`"${data.name} is not defined as a key mapping.`);
//         }
//     }
// }
//
// // function getWeatherData(city, callback) {
// //     const url = `http://api.openweathermap.org/data/2.5/weather?units=metric&appid=YOUR_API_KEY&q=${city}`;
// //     const lib = require('http');
// //     const request = lib.get(url, response => {
// //         if (response.statusCode < 200 || response.statusCode > 299) {
// //             callback('Failed to load page, status code: ' + response.statusCode);
// //         }
// //         const body = [wwwwwwwwwww];
// //         response.on('data', chunk => body.push(chunk));
// //         response.on('end', () => {
// //             const data = body.join('');
// //             const parsed = JSON.parse(data);
// //             console.log(parsed);
// //             callback(`The weather in ${city} is ${parsed.main.temp }°C.`);
// //         });
// //     });
// //     request.on('error', function (err) {
// //         callback('error');
// //     });
// // }
//
// process.stdin.on('keypress', key_listener);

var alt_key_down = false;

const ioHook = require('iohook');

/* In next example we register CTRL+F7 shortcut (in MacOS, for other OS, keycodes can be some different). */

const id = ioHook.registerShortcut([17, 32], (keys) => {
    console.log('Shortcut called with keys:', keys)
});

ioHook.on("keydown", event => {
    console.log(event);
    /* You get object like this
    {
       shiftKey: true,
       altKey: true,
       ctrlKey: false,
       metaKey: false
       keycode: 46,
       rawcode: 8,
       type: 'keydown'
     }
    */

    if(event.altKey === true) {
    //     if (map.has(event.keycode)) {
    //         const command = map.get(event.keycode);
    //         console.log(command);
    //     }
    }
    else {
        if (map.has(event.keycode)) {
            const command = map.get(event.keycode);

            if(command === 'throttle_high') {
                throttle_val++;
                if(throttle_val >= throttle_max) {
                    throttle_val = throttle_max;
                }
                console.log(command + ': ' + throttle_val);
            }
            else if(command === 'throttle_low') {
                throttle_val--;
                if(throttle_val <= throttle_min) {
                    throttle_val = throttle_min;
                }
                console.log(command + ': ' + throttle_val);
            }
            else if(command === 'yaw_right') {
                yaw_val++;
                if(yaw_val >= yaw_max) {
                    yaw_val = yaw_max;
                }
                console.log(command + ': ' + yaw_val);
            }
            else if(command === 'yaw_left') {
                yaw_val--;
                if(yaw_val <= yaw_min) {
                    yaw_val = yaw_min;
                }
                console.log(command + ': ' + yaw_val);
            }
            else if(command === 'pitch_forward') {
                pitch_val++;
                if(pitch_val >= pitch_max) {
                    pitch_val = pitch_max;
                }
                console.log(command + ': ' + pitch_val);
            }
            else if(command === 'pitch_backward') {
                pitch_val--;
                if(pitch_val <= pitch_min) {
                    pitch_val = pitch_min;
                }
                console.log(command + ': ' + pitch_val);
            }
            else if(command === 'roll_right') {
                roll_val++;
                if(roll_val >= roll_max) {
                    roll_val = roll_max;
                }
                console.log(command + ': ' + roll_val);
            }
            else if(command === 'roll_left') {
                roll_val--;
                if(roll_val <= roll_min) {
                    roll_val = roll_min;
                }
                console.log(command + ': ' + roll_val);
            }
        }
    }
});

ioHook.on("keyup", event => {
    //console.log(event);
    /* You get object like this
    {
       shiftKey: true,
       altKey: true,
       ctrlKey: false,
       metaKey: false
       keycode: 46,
       rawcode: 8,
       type: 'keydown'
     }
    */

    if(event.altKey === true) {
        if (map.has(event.keycode)) {
            const command = map.get(event.keycode);
            console.log(command);
        }
    }
    else {
        if (map.has(event.keycode)) {
            const command = map.get(event.keycode);

            if(command === 'throttle_high' || command === 'throttle_low') {
                throttle_val = throttle_neutral;
                console.log(command + ': ' + throttle_val);
            }
            else if(command === 'yaw_left' || command === 'yaw_right') {
                yaw_val = yaw_neutral;
                console.log(command + ': ' + yaw_val);
            }
            else if(command === 'pitch_forward' || command === 'pitch_backward') {
                pitch_val = pitch_neutral;
                console.log(command + ': ' + pitch_val);
            }
            else if(command === 'roll_left' || command === 'roll_right') {
                roll_val = roll_neutral;
                console.log(command + ': ' + roll_val);
            }
        }
    }
});

//register and start hook
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
ioHook.start(true);


function send_joystick() {
    var rc_params = {};
    rc_params.target_system = 20;
    rc_params.target_component = 1;
    rc_params.chan1_raw = throttle_val;
    rc_params.chan2_raw = yaw_val;
    rc_params.chan3_raw = pitch_val;
    rc_params.chan4_raw = roll_val;
    rc_params.chan5_raw = 0;
    rc_params.chan6_raw = 0;
    rc_params.chan7_raw = 0;
    rc_params.chan8_raw = 0;
    rc_params.chan9_raw = 0;
    rc_params.chan10_raw = 0;
    rc_params.chan11_raw = 0;
    rc_params.chan12_raw = 0;
    rc_params.chan13_raw = 0;
    rc_params.chan14_raw = 0;
    rc_params.chan15_raw = 0;
    rc_params.chan16_raw = 0;
    rc_params.chan17_raw = 0;
    rc_params.chan18_raw = 0;

    try {
        var msg = mavlinkGenerateMessage(mavlink.MAVLINK_MSG_ID_RC_CHANNELS_OVERRIDE, rc_params);
        if (msg == null) {
            console.log("mavlink message is null");
        }
        else {
            console.log('msg: ', msg);
            // console.log('msg_seq : ', msg.slice(2,3));
            //mqtt_client.publish(my_cnt_name, msg.toString('hex'));
            //_this.send_aggr_to_Mobius(my_cnt_name, msg.toString('hex'), 1500);
            mqtt_client.publish(target_pub_topic[target_selected], msg);

            setTimeout(send_joystick, 200);
        }
    }
    catch( ex ) {
        console.log( '[ERROR] ' + ex );
    }
}

var _server = null;

var mavPort = null;
var ltePort = null;

var mavPortNum = '/dev/ttyUSB5';
var mavBaudrate = '57600';
var ltePortNum = '/dev/ttyUSB1';
var lteBaudrate = '115200';

exports.ready = function tas_ready() {
    setTimeout(send_joystick, 200);
};

var spawn = require('child_process').spawn;
var djiosdk = null;

function dji_sdk_lunch() {
    djiosdk = spawn('./djiosdk-Mobius', ['UserConfig.txt']);

    djiosdk.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    djiosdk.stderr.on('data', function(data) {
        console.log('stderr: ' + data);

        setTimeout(dji_sdk_lunch, 1500);
    });

    djiosdk.on('exit', function(code) {
        console.log('exit: ' + code);

        setTimeout(dji_sdk_lunch, 1500);
    });

    djiosdk.on('error', function(code) {
        console.log('error: ' + code);

        setTimeout(dji_sdk_lunch, 1500);
    });
}


var aggr_content = {};

function send_aggr_to_Mobius(topic, content_each, gap) {
    if(aggr_content.hasOwnProperty(topic)) {
        var timestamp = moment().format('YYYY-MM-DDTHH:mm:ssSSS');
        aggr_content[topic][timestamp] = content_each;
    }
    else {
        aggr_content[topic] = {};
        timestamp = moment().format('YYYY-MM-DDTHH:mm:ssSSS');
        aggr_content[topic][timestamp] = content_each;

        setTimeout(function () {
            sh_adn.crtci(topic+'?rcn=0', 0, aggr_content[topic], null, function () {

            });

            delete aggr_content[topic];
        }, gap, topic);
    }
}

function mavlinkGenerateMessage(type, params) {
    var TEST_GEN_MAVLINK_SYSTEM_ID = 8;
    const mavlinkParser = new MAVLink(null/*logger*/, TEST_GEN_MAVLINK_SYSTEM_ID, 0);
    try {
        var mavMsg = null;
        var genMsg = null;
        //var targetSysId = sysId;
        var targetCompId = (params.targetCompId == undefined)?
            0:
            params.targetCompId;

        switch( type ) {
            // MESSAGE ////////////////////////////////////
            case mavlink.MAVLINK_MSG_ID_PING:
                mavMsg = new mavlink.messages.ping(params.time_usec, params.seq, params.target_system, params.target_component);
                break;
            case mavlink.MAVLINK_MSG_ID_HEARTBEAT:
                mavMsg = new mavlink.messages.heartbeat(params.type,
                    params.autopilot,
                    params.base_mode,
                    params.custom_mode,
                    params.system_status,
                    params.mavlink_version);
                break;
            case mavlink.MAVLINK_MSG_ID_GPS_RAW_INT:
                mavMsg = new mavlink.messages.gps_raw_int(params.time_usec,
                    params.fix_type,
                    params.lat,
                    params.lon,
                    params.alt,
                    params.eph,
                    params.epv,
                    params.vel,
                    params.cog,
                    params.satellites_visible,
                    params.alt_ellipsoid,
                    params.h_acc,
                    params.v_acc,
                    params.vel_acc,
                    params.hdg_acc);
                break;
            case mavlink.MAVLINK_MSG_ID_ATTITUDE:
                mavMsg = new mavlink.messages.attitude(params.time_boot_ms,
                    params.roll,
                    params.pitch,
                    params.yaw,
                    params.rollspeed,
                    params.pitchspeed,
                    params.yawspeed);
                break;
            case mavlink.MAVLINK_MSG_ID_GLOBAL_POSITION_INT:
                mavMsg = new mavlink.messages.global_position_int(params.time_boot_ms,
                    params.lat,
                    params.lon,
                    params.alt,
                    params.relative_alt,
                    params.vx,
                    params.vy,
                    params.vz,
                    params.hdg);
                break;
            case mavlink.MAVLINK_MSG_ID_RC_CHANNELS_OVERRIDE:
                mavMsg = new mavlink.messages.rc_channels_override(params.time_boot_ms,
                    params.target_system,
                    params.target_component,
                    params.chan1_raw,
                    params.chan2_raw,
                    params.chan3_raw,
                    params.chan4_raw,
                    params.chan5_raw,
                    params.chan6_raw,
                    params.chan7_raw,
                    params.chan8_raw,
                    params.chan9_raw,
                    params.chan10_raw,
                    params.chan11_raw,
                    params.chan12_raw,
                    params.chan13_raw,
                    params.chan14_raw,
                    params.chan15_raw,
                    params.chan16_raw,
                    params.chan17_raw,
                    params.chan18_raw);
                break;
        }
    }
    catch( e ) {
        console.log( 'MAVLINK EX:' + e );
    }

    if (mavMsg) {
        genMsg = Buffer.from(mavMsg.pack(mavlinkParser));
        //console.log('>>>>> MAVLINK OUTGOING MSG: ' + genMsg.toString('hex'));
    }

    return genMsg;
}

function sendDroneMessage(type, params) {
    try {
        var msg = mavlinkGenerateMessage(type, params);
        if (msg == null) {
            console.log("mavlink message is null");
        }
        else {
            console.log('msg: ', msg);
            // console.log('msg_seq : ', msg.slice(2,3));
            //mqtt_client.publish(my_cnt_name, msg.toString('hex'));
            //_this.send_aggr_to_Mobius(my_cnt_name, msg.toString('hex'), 1500);
            mavPortData(msg);
        }
    }
    catch( ex ) {
        console.log( '[ERROR] ' + ex );
    }
}

var dji = {};
var params = {};

function dji_handler(data) {
    var data_arr = data.toString().split(',');

    dji.flightstatus = data_arr[0].replace('[', '');
    dji.timestamp = data_arr[1].slice(1, data_arr[1].length);
    dji.lat = data_arr[2];
    dji.lon = data_arr[3];
    dji.alt = data_arr[4];
    dji.relative_alt = data_arr[5];
    dji.roll = data_arr[6];
    dji.pitch = data_arr[7];
    dji.yaw = data_arr[8];
    dji.vx = data_arr[9];
    dji.vy = data_arr[10];
    dji.vz = data_arr[11];
    dji.battery = data_arr[12].replace(']', '');

    // #0 PING
    params.time_usec = dji.timestamp;
    params.seq = 0;
    params.target_system = 0;
    params.target_component = 0;
    setTimeout(sendDroneMessage, 1, mavlink.MAVLINK_MSG_ID_PING, params);

    // #1 HEARTBEAT
    params.type = 2;
    params.autopilot = 3;

    if(dji.flightstatus == '0') {
        params.base_mode = 81;
    }
    else {
        params.base_mode = (81 | 0x80);
    }

    params.system_status = 4;
    params.mavlink_version = 3;
    setTimeout(sendDroneMessage, 1, mavlink.MAVLINK_MSG_ID_HEARTBEAT, params);

    // #2 MAVLINK_MSG_ID_GPS_RAW_INT
    params.time_usec = dji.timestamp;
    params.fix_type = 3;
    params.lat = parseFloat(dji.lat) * 1E7;
    params.lon = parseFloat(dji.lon) * 1E7;
    params.alt = parseFloat(dji.alt) * 1000;
    params.eph = 175;
    params.epv = 270;
    params.vel = 7;
    params.cog = 0;
    params.satellites_visible = 7;
    params.alt_ellipsoid = 0;
    params.h_acc = 0;
    params.v_acc = 0;
    params.vel_acc = 0;
    params.hdg_acc = 0;
    setTimeout(sendDroneMessage, 1, mavlink.MAVLINK_MSG_ID_GPS_RAW_INT, params);

    // #3 MAVLINK_MSG_ID_ATTITUDE
    params.time_boot_ms = dji.timestamp;
    params.roll = dji.roll;
    params.pitch = dji.pitch;
    params.yaw = dji.yaw;
    params.rollspeed = -0.00011268721573287621;
    params.pitchspeed = 0.0000612109579378739;
    params.yawspeed = -0.00031687552109360695;
    setTimeout(sendDroneMessage, 1, mavlink.MAVLINK_MSG_ID_ATTITUDE, params);

    // #4 MAVLINK_MSG_ID_GLOBAL_POSITION_INT
    params.time_boot_ms = dji.timestamp;
    params.lat = parseFloat(dji.lat) * 1E7;
    params.lon = parseFloat(dji.lon) * 1E7;
    params.alt = parseFloat(dji.alt) * 1000;
    params.relative_alt = dji.relative_alt;
    params.vx = dji.vx;
    params.vy = dji.vy;
    params.vz = dji.vz;
    params.hdg = 0;
    setTimeout(sendDroneMessage, 1, mavlink.MAVLINK_MSG_ID_GLOBAL_POSITION_INT, params);
}

exports.noti = function (path_arr, cinObj, socket) {
    var cin = {};
    cin.ctname = path_arr[path_arr.length - 2];
    cin.con = (cinObj.con != null) ? cinObj.con : cinObj.content;

    if (cin.con == '') {
        console.log('---- is not cin message');
    }
    else {
        socket.write(JSON.stringify(cin));
    }
};

exports.gcs_noti_handler = function (message) {
    if (mavPort != null) {
        if (mavPort.isOpen) {
            mavPort.write(message);
        }
    }
};

var SerialPort = require('serialport');

function mavPortOpening() {
    if (mavPort == null) {
        mavPort = new SerialPort(mavPortNum, {
            baudRate: parseInt(mavBaudrate, 10),
        });

        mavPort.on('open', mavPortOpen);
        mavPort.on('close', mavPortClose);
        mavPort.on('error', mavPortError);
        mavPort.on('data', mavPortData);
    }
    else {
        if (mavPort.isOpen) {

        }
        else {
            mavPort.open();
        }
    }
}

function mavPortOpen() {
    console.log('mavPort open. ' + mavPortNum + ' Data rate: ' + mavBaudrate);
}

function mavPortClose() {
    console.log('mavPort closed.');

    setTimeout(mavPortOpening, 2000);
}

function mavPortError(error) {
    var error_str = error.toString();
    console.log('[mavPort error]: ' + error.message);
    if (error_str.substring(0, 14) == "Error: Opening") {

    }
    else {
        console.log('mavPort error : ' + error);
    }

    setTimeout(mavPortOpening, 2000);
}

global.mav_ver = 1;

var mavStr = [];
var mavStrPacket = '';

var pre_seq = 0;
function mavPortData(data) {
    mavStr += data.toString('hex');
    if(data[0] == 0xfe || data[0] == 0xfd) {
        var mavStrArr = [];

        var str = '';
        var split_idx = 0;

        mavStrArr[split_idx] = str;
        for (var i = 0; i < mavStr.length; i+=2) {
            str = mavStr.substr(i, 2);

            if(mav_ver == 1) {
                if (str == 'fe') {
                    mavStrArr[++split_idx] = '';
                }
            }
            else if(mav_ver == 2) {
                if (str == 'fd') {
                    mavStrArr[++split_idx] = '';
                }
            }

            mavStrArr[split_idx] += str;
        }
        mavStrArr.splice(0, 1);

        var mavPacket = '';
        for (var idx in mavStrArr) {
            if(mavStrArr.hasOwnProperty(idx)) {
                mavPacket = mavStrPacket + mavStrArr[idx];

                if(mav_ver == 1) {
                    var refLen = (parseInt(mavPacket.substr(2, 2), 16) + 8) * 2;
                }
                else if(mav_ver == 2) {
                    refLen = (parseInt(mavPacket.substr(2, 2), 16) + 12) * 2;
                }

                if(refLen == mavPacket.length) {
                    mqtt_client.publish(my_cnt_name, Buffer.from(mavPacket, 'hex'));
                    send_aggr_to_Mobius(my_cnt_name, mavPacket, 1500);
                    mavStrPacket = '';

                    setTimeout(parseMav, 0, mavPacket);
                }
                else if(refLen < mavPacket.length) {
                    mavStrPacket = '';
                    //console.log('                        ' + mavStrArr[idx]);
                }
                else {
                    mavStrPacket = mavPacket;
                    //console.log('                ' + mavStrPacket.length + ' - ' + mavStrPacket);
                }
            }
        }

        if(mavStrPacket != '') {
            mavStr = mavStrPacket;
            mavStrPacket = '';
        }
        else {
            mavStr = '';
        }
    }
}

var gpi = {};
gpi.GLOBAL_POSITION_INT = {};

var hb = {};
hb.HEARTBEAT = {};

var flag_base_mode = 0;

function parseMav(mavPacket) {
    var ver = mavPacket.substr(0, 2);
    if (ver == 'fd') {
        var sysid = mavPacket.substr(10, 2).toLowerCase();
        var msgid = mavPacket.substr(14, 6).toLowerCase();
    }
    else {
        sysid = mavPacket.substr(6, 2).toLowerCase();
        msgid = mavPacket.substr(10, 2).toLowerCase();
    }

    var cur_seq = parseInt(mavPacket.substr(4, 2), 16);

    if(pre_seq == cur_seq) {
        //console.log('        ' + pre_seq + ' - ' + cur_seq + ' - ' + mavPacket);
    }
    else {
        //console.log('        ' + pre_seq + ' - ' + cur_seq + ' - ' + mavPacket;
    }
    pre_seq = (cur_seq + 1) % 256;

    // if(sysid == '37' ) {
    //     console.log('55 - ' + content_each);
    // }
    // else if(sysid == '0a' ) {
    //     console.log('10 - ' + content_each);
    // }
    // else if(sysid == '21' ) {
    //     console.log('33 - ' + content_each);
    // }
    // else if(sysid == 'ff' ) {
    //     console.log('255 - ' + content_each);
    // }

    if (msgid == '21') { // #33
        if(authResult == 'done') {
            if (secPort.isOpen) {
                var len = mavPacket.length/2;
                const tr_ch = new Uint8Array(5 + len);
                tr_ch[0] = 0x5a;
                tr_ch[1] = 0xa5;
                tr_ch[2] = 0xf7;
                tr_ch[3] = (len / 256);
                tr_ch[4] = (len % 256);

                for (var idx = 0; idx < len; idx++) {
                    tr_ch[5 + idx] = parseInt(mavPacket.substr(idx*2, 2), 16);
                }

                const message = Buffer.from(tr_ch.buffer);
                secPort.write(message);
            }
        }

        if (ver == 'fd') {
            var base_offset = 20;
            var time_boot_ms = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            var lat = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            var lon = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            var alt = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            var relative_alt = mavPacket.substr(base_offset, 8).toLowerCase();
        }
        else {
            base_offset = 12;
            time_boot_ms = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            lat = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            lon = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            alt = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            relative_alt = mavPacket.substr(base_offset, 8).toLowerCase();
        }

        gpi.GLOBAL_POSITION_INT.time_boot_ms = Buffer.from(time_boot_ms, 'hex').readUInt32LE(0);
        gpi.GLOBAL_POSITION_INT.lat = Buffer.from(lat, 'hex').readInt32LE(0);
        gpi.GLOBAL_POSITION_INT.lon = Buffer.from(lon, 'hex').readInt32LE(0);
        gpi.GLOBAL_POSITION_INT.alt = Buffer.from(alt, 'hex').readInt32LE(0);
        gpi.GLOBAL_POSITION_INT.relative_alt = Buffer.from(relative_alt, 'hex').readInt32LE(0);

        //console.log(gpi);
    }

    else if (msgid == '4c') { // #76 : COMMAND_LONG
        // if(authResult == 'done') {
        //     if (secPort.isOpen) {
        //         len = parseInt(mavPacket.substr(2, 2), 16);
        //         const tr_ch = new Uint8Array(5 + len);
        //         tr_ch[0] = 0x5a;
        //         tr_ch[1] = 0xa5;
        //         tr_ch[2] = 0xf7;
        //         tr_ch[3] = (len / 256);
        //         tr_ch[4] = (len % 256);
        //
        //         for (idx = 0; idx < len; idx++) {
        //             tr_ch[5 + idx] = parseInt(mavPacket.substr((10 + idx) * 2, 2), 16);
        //         }
        //
        //         const message = Buffer.from(tr_ch.buffer);
        //         secPort.write(message);
        //     }
        // }
    }

    else if (msgid == '00') { // #00 : HEARTBEAT
        if(authResult == 'done') {
            if (secPort.isOpen) {
                len = mavPacket.length/2;
                const tr_ch = new Uint8Array(5 + len);
                tr_ch[0] = 0x5a;
                tr_ch[1] = 0xa5;
                tr_ch[2] = 0xf9;
                tr_ch[3] = (len / 256);
                tr_ch[4] = (len % 256);

                for (idx = 0; idx < len; idx++) {
                    tr_ch[5 + idx] = parseInt(mavPacket.substr(idx*2, 2), 16);
                }

                const message = Buffer.from(tr_ch.buffer);
                secPort.write(message);
            }
        }

        if (ver == 'fd') {
            base_offset = 20;
            var custom_mode = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            var type = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            var autopilot = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            var base_mode = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            var system_status = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            var mavlink_version = mavPacket.substr(base_offset, 2).toLowerCase();
        }
        else {
            base_offset = 12;
            custom_mode = mavPacket.substr(base_offset, 8).toLowerCase();
            base_offset += 8;
            type = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            autopilot = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            base_mode = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            system_status = mavPacket.substr(base_offset, 2).toLowerCase();
            base_offset += 2;
            mavlink_version = mavPacket.substr(base_offset, 2).toLowerCase();
        }

        //console.log(mavPacket);
        hb.HEARTBEAT.type = Buffer.from(type, 'hex').readUInt8(0);
        hb.HEARTBEAT.autopilot = Buffer.from(autopilot, 'hex').readUInt8(0);
        hb.HEARTBEAT.base_mode = Buffer.from(base_mode, 'hex').readUInt8(0);
        hb.HEARTBEAT.custom_mode = Buffer.from(custom_mode, 'hex').readUInt32LE(0);
        hb.HEARTBEAT.system_status = Buffer.from(system_status, 'hex').readUInt8(0);
        hb.HEARTBEAT.mavlink_version = Buffer.from(mavlink_version, 'hex').readUInt8(0);

        if(hb.HEARTBEAT.base_mode & 0x80) {
            if(flag_base_mode == 0) {
                flag_base_mode = 1;

                // my_sortie_name = 'disarm';
                // my_cnt_name = my_parent_cnt_name + '/' + my_sortie_name;
                // sh_adn.del_resource(my_cnt_name+'?rcn=0', function () {
                //     console.log('delete container named disarm')
                // });

                //lte_mission_name = lte_parent_mission_name + '/' + my_sortie_name;
                // sh_adn.del_resource(lte_mission_name+'?rcn=0', function () {
                //     console.log('delete container named disarm')
                // });

                my_sortie_name = moment().format('YYYY_MM_DD_T_HH_mm');
                my_cnt_name = my_parent_cnt_name + '/' + my_sortie_name;
                sh_adn.crtct(my_parent_cnt_name+'?rcn=0', my_sortie_name, 0, function (rsc, res_body, count) {
                });

                lte_mission_name = lte_parent_mission_name + '/' + my_sortie_name;
                sh_adn.crtct(lte_parent_mission_name+'?rcn=0', my_sortie_name, 0, function (rsc, res_body, count) {
                });
            }
        }
        else {
            flag_base_mode = 0;
            my_sortie_name = 'disarm';
            my_cnt_name = my_parent_cnt_name + '/' + my_sortie_name;
            // sh_adn.crtct(my_parent_cnt_name+'?rcn=0', my_sortie_name, 0, function (rsc, res_body, count) {
            // });

            lte_mission_name = lte_parent_mission_name + '/' + my_sortie_name;
            // sh_adn.crtct(lte_parent_mission_name+'?rcn=0', my_sortie_name, 0, function (rsc, res_body, count) {
            // });
        }

        //console.log(hb);
    }
}

function ltePortOpening() {
    if (ltePort == null) {
        ltePort = new SerialPort(ltePortNum, {
            baudRate: parseInt(lteBaudrate, 10)
        });

        ltePort.on('open', ltePortOpen);
        ltePort.on('close', ltePortClose);
        ltePort.on('error', ltePortError);
        ltePort.on('data', ltePortData);
    }
    else {
        if (ltePort.isOpen) {

        }
        else {
            ltePort.open();
        }
    }
}

function ltePortOpen() {
    console.log('ltePort open. ' + ltePortNum + ' Data rate: ' + lteBaudrate);

    setInterval(lteReqGetRssi, 2000);
}

function ltePortClose() {
    console.log('ltePort closed.');

    setTimeout(ltePortOpening, 2000);
}

function ltePortError(error) {
    var error_str = error.toString();
    console.log('[ltePort error]: ' + error.message);
    if (error_str.substring(0, 14) == "Error: Opening") {

    }
    else {
        console.log('[ltePort error]: ' + error);
    }

    setTimeout(ltePortOpening, 2000);
}

function lteReqGetRssi() {
    if(ltePort != null) {
        if (ltePort.isOpen) {
            //var message = Buffer.from('AT+CSQ\r');
            var message = Buffer.from('AT@DBG\r');
            ltePort.write(message);
        }
    }
}

var count = 0;
var strRssi = '';

function ltePortData(data) {
    strRssi += data.toString();

    //console.log(strRssi);

    var arrRssi = strRssi.split('OK');

    if(arrRssi.length >= 2) {
        //console.log(arrRssi);

        var strLteQ = arrRssi[0].replace(/ /g, '');
        var arrLteQ = strLteQ.split(',');

        for(var idx in arrLteQ) {
            if(arrLteQ.hasOwnProperty(idx)) {
                //console.log(arrLteQ[idx]);
                var arrQValue = arrLteQ[idx].split(':');
                if(arrQValue[0] == '@DBG') {
                    gpi.GLOBAL_POSITION_INT.plmn = arrQValue[2];
                }
                else if(arrQValue[0] == 'Band') {
                    gpi.GLOBAL_POSITION_INT.band = parseInt(arrQValue[1]);
                }
                else if(arrQValue[0] == 'EARFCN') {
                    gpi.GLOBAL_POSITION_INT.earfcn = parseInt(arrQValue[1]);
                }
                else if(arrQValue[0] == 'Bandwidth') {
                    gpi.GLOBAL_POSITION_INT.bandwidth = parseInt(arrQValue[1].replace('MHz', ''));
                }
                else if(arrQValue[0] == 'PCI') {
                    gpi.GLOBAL_POSITION_INT.pci = parseInt(arrQValue[1]);
                }
                else if(arrQValue[0] == 'Cell-ID') {
                    gpi.GLOBAL_POSITION_INT.cell_id = arrQValue[1];
                }
                else if(arrQValue[0] == 'GUTI') {
                    gpi.GLOBAL_POSITION_INT.guti = arrQValue[1];
                }
                else if(arrQValue[0] == 'TAC') {
                    gpi.GLOBAL_POSITION_INT.tac = parseInt(arrQValue[1]);
                }
                else if(arrQValue[0] == 'RSRP') {
                    gpi.GLOBAL_POSITION_INT.rsrp = parseFloat(arrQValue[1].replace('dbm', ''));
                }
                else if(arrQValue[0] == 'RSRQ') {
                    gpi.GLOBAL_POSITION_INT.rsrq = parseFloat(arrQValue[1].replace('dbm', ''));
                }
                else if(arrQValue[0] == 'RSSI') {
                    gpi.GLOBAL_POSITION_INT.rssi = parseFloat(arrQValue[1].replace('dbm', ''));
                }
                else if(arrQValue[0] == 'SINR') {
                    gpi.GLOBAL_POSITION_INT.sinr = parseFloat(arrQValue[1].replace('db', ''));
                }
            }
        }

        //console.log(gpi);

        setTimeout(sendLteRssi, 0, gpi);

        strRssi = '';
    }
}

function sendLteRssi(gpi) {
    var parent = lte_mission_name+'?rcn=0';
    sh_adn.crtci(parent, 0, gpi, null, function () {

    });
}

