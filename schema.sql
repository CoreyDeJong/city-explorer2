
-- best to drop the table so that any changes are made when devloping will be replaced before entering in new data
DROP TABLE IF EXISTS city_explorer_table;

CREATE TABLE city_explorer_table (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(2555),
    formatted_query VARCHAR(2555),
    latitude NUMERIC(20,14),
    longitude NUMERIC(20,14)
    -- latitude VARCHAR(2555),
    -- longitude VARCHAR(2555)
);

-- INSERT INTO city_explorer_table (search_query, formatted_query, latitude, longitude) VALUES ('seattle', 'seattle', 'seattle_test_lat', 'seattle_test_lon');

-- SELECT * FROM city_explorer_table;