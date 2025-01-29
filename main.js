ymaps.ready(function () {

    fetch('open.json')
        .then(response => response.json())
        .then(obj => {

            console.log(obj);
            const searchControls = new ymaps.control.SearchControl({
                options: {
                    float: 'right',
                    noPlacemark: true
                }
            });

            const myMap = new ymaps.Map("map", {
                center: [55.76, 37.64], // Центр карты (можно изменить)
                zoom: 7, // Начальный уровень зума
                controls: [searchControls]
            });

            const removeControls = [
                'geolocationControl',
                'trafficControl',
                'fullscreenControl',
                'zoomControl',
                'rulerControl',
                'typeSelector'
            ];

            // Очищаем карту от ненужных элементов управления
            const clearTheMap = myMap => {
                removeControls.forEach(controls => myMap.controls.remove(controls));
            };

            clearTheMap(myMap);

            const objectManager = new ymaps.ObjectManager({
                clusterize: true,
                clusterIconLayout: "default#pieChart"
            });

            // Обрабатываем объекты, инвертируя координаты
            obj.features.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                    // Меняем местами долготу и широту
                    const [longitude, latitude] = feature.geometry.coordinates; // корректируем порядок координат
                    feature.geometry.coordinates = [latitude, longitude];  // инвертируем координаты
                }
            });

            // Добавляем измененные объекты на карту
            objectManager.add(obj);
            myMap.geoObjects.add(objectManager);
        });
});
