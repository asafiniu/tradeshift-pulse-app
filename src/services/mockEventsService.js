'use strict'

const _ = require('lodash');
const countryLatLonData = require('../../data/countrycode-latlong');
const countryNameData = require('../../data/countrycode-name');

function MockEventsService(NumberUtil, ConstantsService) {
    const VOLUME_MIN = ConstantsService.VOLUME_MIN;
	const VOLUME_MAX = ConstantsService.VOLUME_MAX;
    const EVENTS_PER_CALLBACK = 10;
    const testCountries = [
        {
            source: getCountry('jm'),
            dest: getCountry('nz'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('is'),
            dest: getCountry('jp'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('mg'),
            dest: getCountry('za'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('mg'),
            dest: getCountry('tw'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('ie'),
            dest: getCountry('it'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('uy'),
            dest: getCountry('ve'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('gt'),
            dest: getCountry('cu'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('pt'),
            dest: getCountry('kr'),
            volume: getRandomVolume(),
        },
        {
            source: getCountry('bn'),
            dest: getCountry('sb'),
            volume: getRandomVolume(),
        },
    ];

    const service = {};

    service.startEventStream = (callback) => {
        sendEvents(callback);
        
        setInterval(() => {
            sendEvents(callback);
        }, 5000);   
    }

    function getRandomVolume() {
        return NumberUtil.getRandomInt(VOLUME_MIN, VOLUME_MAX);
    }

    function getCountry(isoCode) {
        const countries = _.keys(countryLatLonData);
        const iso = !_.isNil(isoCode) ? isoCode : countries[NumberUtil.getRandomInt(0, countries.length - 1)];
        const [ lat, lon ] = countryLatLonData[iso];
        const name = countryNameData[_.upperCase(iso)];
        return { iso, lat, lon, name };
    }

    function sendEvents(callback) {
        const events = _.reduce(_.range(EVENTS_PER_CALLBACK), (data) => {
            return _.union(data, [
                {
                    source: getCountry(),
                    dest: getCountry(),
                    volume: getRandomVolume(),
                },
            ]);
        }, []);
        callback(events);
    }

    const countries = _.keys(countryLatLonData);
    countries.forEach((iso) => {
        if (_.isNil(countryNameData[_.upperCase(iso)])) {
            console.log(iso);
        }
    });

    return service;
}

module.exports = [
    'NumberUtil',
    'ConstantsService',
    MockEventsService,
];
