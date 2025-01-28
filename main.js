ymaps.ready(function () {

    fetch('open.geojson')
        .then(arr => arr.json())

        .then(obj => {

            console.log(obj)
            const searchControls = new ymaps.control.SearchControl({
                options: {
                    float: 'right',
                    noPlacemark: true
                }
            })

            const myMap = new ymaps.Map("map", {
                center: [55.76, 37.64],
                zoom: 7,
                controls: [searchControls]
            })

            const removeControls = [
                'geolocationControl',
                'trafficControl',
                'fullscreenControl',
                'zoomControl', 'rulerControl',
                'typeSelector'
            ]

            const clearTheMap = myMap => {
                removeControls
                    .forEach(controls => myMap.controls.remove(controls))
            }

            clearTheMap(myMap)

            const objectManager = new ymaps.ObjectManager({
                clusterize: true,
                clusterIconLayout: "default#pieChart"
            })


                objectManager.add(obj)
                myMap.geoObjects.add(objectManager)
        })
})
