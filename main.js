ymaps.ready(function () {

    fetch('open.json')
        .then(arr => arr.json())
        .then(obj => {

            const searchControls = new ymaps.control.SearchControl({
                options: {
                    float: 'right',
                    noPlacemark: true
                }
            });

            const myMap = new ymaps.Map("map", {
                center: [55.76, 37.64], // начальная позиция карты
                zoom: 7, // начальный уровень зума
                controls: [searchControls]
            });

            const removeControls = [
                'geolocationControl',
                'trafficControl',
                'fullscreenControl',
                'zoomControl', 'rulerControl',
                'typeSelector'
            ];

            const clearTheMap = myMap => {
                removeControls.forEach(controls => myMap.controls.remove(controls));
            };

            clearTheMap(myMap);

            const objectManager = new ymaps.ObjectManager({
                clusterize: true, // Включаем кластеризацию
                clusterIconLayout: "default#pieChart" // Используем стандартный layout для кластеров
            });

            // Нормализация данных координат
            const normalizedData = obj.features.map(feature => {
                const [longitude, latitude] = feature.geometry.coordinates;

                // Проверяем и корректируем координаты, если необходимо
                if (Math.abs(longitude) > 180) {
                    feature.geometry.coordinates = [longitude / 10, latitude]; // нормализуем долготу
                }

                return feature;
            });

            // Обрабатываем и добавляем данные
            objectManager.add({ type: "FeatureCollection", features: normalizedData });
            myMap.geoObjects.add(objectManager);

            // Пример кластера: можно задать минимальный зум для отображения
            objectManager.clusters.options.set('clusterDisableClickZoom', false);
            objectManager.clusters.options.set('gridSize', 50);  // размер сетки для кластеров
        });
});
