import { vhToPx } from '../utils'

module.exports = {
  get: () => {
    // change to real data late
    return new Promise(function(resolve, reject) {
      resolve({
        data: {
          content: {
            MainHeader: {
              children: [
                {
                  dom: 'div',
                  text: 'Welcome founding',
                  style: 'font-size: ' + vhToPx(6) + ';',
                },
                {
                  dom: 'div',
                  text: 'ambassador',
                  style:
                    'font-size: ' +
                    vhToPx(7.8) +
                    ';color:#efdf18;font-family:pamainextrabold;',
                },
              ],
              style:
                'font-family:pamainlight;margin-bottom:7%;margin-top:6%;text-align: center;text-transform: uppercase;line-height:1;',
              dom: 'div',
            },
            SubHeader: {
              dom: 'div',
              style:
                'text-transform:uppercase;margin-bottom:' +
                vhToPx(0.96) +
                ';font-size: ' +
                vhToPx(3.65) +
                ';font-family:pamainregular;text-align: center;letter-spacing: ' +
                vhToPx(0.21) +
                ';line-height: 1;',
              children: [
                {
                  dom: 'span',
                  text: 'View ',
                  style:
                    'font-family:pamainbold;color:#ed1c24;text-transform:uppercase;',
                },
                { dom: 'span', text: 'and ' },
                {
                  dom: 'span',
                  text: 'share ',
                  style:
                    'font-family:pamainbold;color:#ed1c24;text-transform:uppercase;',
                },
                { dom: 'span', text: 'this' },
                { dom: 'br' },
                {
                  dom: 'span',
                  text: 'Football DEMO Experience',
                  style:
                    'font-size: ' + vhToPx(4.2) + ';font-family:pamainbold;',
                },
              ],
            },
            SectionEvents: {
              dom: 'div',
              style:
                'margin-top: ' +
                vhToPx(2) +
                ';padding-left:15%;padding-right:15%;color: #d1d3d4;font-size: ' +
                vhToPx(1.63) +
                ';line-height: 1.5;text-align: center;',
              children: [
                {
                  dom: 'span',
                  text:
                    'CONFIDENTIAL INFORMATION. This DEMO and the information contained herein is confidential and has been furnished to you solely for your information and may not be reproduced, disclosed, or redistributed, in whole or in part, by mail, facsimile, electronic or computer transmission or by any other means to any other person, except with prior written consent of the company. ©SPORTOCO, All Rights Reserved.',
                },
              ],
            },
          },
          secondaryContent: {
            MainHeader: {
              children: [
                {
                  dom: 'span',
                  text: 'Sign-in and ',
                },
                {
                  dom: 'span',
                  style: 'font-family:pamainbold;',
                  text: 'earn',
                },
              ],
              style:
                'line-height: 1;font-size: ' +
                vhToPx(5) +
                ';text-align: center;text-transform: uppercase; margin-top: ' +
                vhToPx(1) +
                ';',
              dom: 'div',
            },
            SubHeader: {
              dom: 'div',
              style:
                'font-size: ' +
                vhToPx(6) +
                ';text-align: center;letter-spacing: ' +
                vhToPx(0.2) +
                ';line-height: 1;text-transform: uppercase;',
              children: [
                {
                  dom: 'span',
                  style: 'font-family:pamainextrabold;color: #ffb600',
                  text: 'tokens',
                },
                { dom: 'span', text: ' & ' },
                {
                  dom: 'span',
                  style: 'font-family:pamainextrabold;color:#17c5ff',
                  text: 'points',
                },
              ],
            },
            SectionEvents: {
              dom: 'div',
              style:
                'margin:' +
                vhToPx(3.8) +
                ' 0 ' +
                vhToPx(3.8) +
                ' 0;text-transform:uppercase;font-size: ' +
                vhToPx(5) +
                ';font-weight: lighter;text-align: center;line-height: 1;',
              children: [
                { dom: 'span', text: 'to be used' },
                { dom: 'br' },
                { dom: 'span', style: 'font-family:pamainbold;', text: 'at' },
                {
                  dom: 'span',
                  style: 'color:#ed1c24;font-family:pamainbold;',
                  text: ' live ',
                },
                {
                  dom: 'span',
                  style: 'font-family:pamainbold;',
                  text: 'events',
                },
                { dom: 'br' },
                { dom: 'span', style: '', text: 'this fall' },
              ],
            },
            SubHeader2: {
              dom: 'div',
              style:
                'margin:' +
                ' 0 0 ' +
                vhToPx(3.8) +
                ' 0;text-transform:uppercase;font-size: ' +
                vhToPx(5) +
                ';font-weight: lighter;text-align: center;line-height: 1;',
              children: [
                { dom: 'span', text: 'get your' },
                {
                  dom: 'span',
                  style: 'color:#19d1be;font-family:pamainextrabold;',
                  text: ' key ',
                },
                { dom: 'span', text: 'and' },
                {
                  dom: 'span',
                  style: 'font-family:pamainextrabold;color:#ed1c24;',
                  text: ' share',
                },

                { dom: 'br' },
                {
                  dom: 'span',
                  style:
                    'font-size:' + vhToPx(5.1) + ';font-family:pamainlight',
                  text: 'this ',
                },
                {
                  dom: 'span',
                  style:
                    'font-size:' + vhToPx(5.1) + ';font-family:pamainextrabold',
                  text: 'football demo',
                },

                { dom: 'br' },

                { dom: 'div', style: 'margin-top: ' + vhToPx(-1) + ';' },
                {
                  dom: 'span',
                  style: 'font-size:' + vhToPx(3.9) + ';',
                  text: 'for bonus',
                },
                {
                  dom: 'span',
                  style:
                    'font-size:' +
                    vhToPx(3.9) +
                    ';font-family:pamainextrabold;color: #ffb600',
                  text: ' tokens ',
                },
                {
                  dom: 'span',
                  style: 'font-size:' + vhToPx(3.5) + ';',
                  text: '&',
                },
                {
                  dom: 'span',
                  style:
                    'font-size:' +
                    vhToPx(3.9) +
                    ';font-family:pamainextrabold;color:#17c5ff',
                  text: ' points',
                },
              ],
            },
          },
        },
      })
    })
  },
}
