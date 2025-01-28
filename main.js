ymaps.ready(function () {
    const myMap = new ymaps.Map('map', {
        center: [55.751574, 37.573856], // Центр карты
        zoom: 9, // Уровень масштаба
        controls: ['zoomControl', 'geolocationControl'] // Контролы карты
    }, {
        // Включаем мультитач для карты
        behaviors: ['default', 'multiTouch']
    });

    const clusterer = new ymaps.Clusterer({
        clusterIconLayout: 'default#pieChart', // Макет кластеров
        clusterIconPieChartRadius: 25,
        clusterIconPieChartCoreRadius: 10,
        clusterIconPieChartStrokeWidth: 3,
        hasBalloon: false, // Без всплывающего окна
        interactivityModel: 'default#geoObject' // Прокидываем события мультитач на карту
    });

    // Загружаем GeoJSON и создаем метки
    fetch('open.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            const geoObjects = geojsonData.features
                .filter(feature => feature.geometry.type === "Point") // Только точки
                .map(feature => {
                    const coordinates = feature.geometry.coordinates;
                    return new ymaps.Placemark(
                        [coordinates[1], coordinates[0]], // Широта и долгота
                        {
                            hintContent: feature.properties.description,
                            balloonContent: feature.properties.description,
                            markerColor: feature.properties["marker-color"] || "#1E90FF"
                        },
                        {
                            preset: "islands#icon",
                            iconColor: feature.properties["marker-color"] || "#1E90FF",
                            interactivityModel: 'default#geoObject' // Прокидываем события мультитач на карту
                        }
                    );
                });

            // Добавляем метки в кластеризатор
            clusterer.add(geoObjects);

            // Добавляем кластеризатор на карту
            myMap.geoObjects.add(clusterer);

            // Обрабатываем нажатия на кластеры
            clusterer.events.add('click', function (e) {
                const target = e.get('target'); // Кластер, по которому кликнули
                if (target && target.properties.get('geoObjects')) {
                    // Если это кластер, зуммируем карту к его границам
                    myMap.setBounds(target.getBounds(), {
                        checkZoomRange: true
                    });
                }
            });

            // Обрабатываем нажатия на метки
            geoObjects.forEach(placemark => {
                placemark.events.add('click', function () {
                    placemark.balloon.open(); // Открываем балун метки
                });
            });
        })
        .catch(error => {
            console.error("Ошибка загрузки GeoJSON:", error);
        });
});
