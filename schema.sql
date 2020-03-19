

DROP TABLE IF EXISTS city_explorer_table;

CREATE TABLE city_explorer_table (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(2555),
    latitude VARCHAR(2555),
    longitude VARCHAR(2555)
);

INSERT INTO city_explorer_table (city_name, latitude, longitude) VALUES ('seattle', 'seattle_test_lat', 'seattle_test_lon');

SELECT * FROM city_explorer_table;