import React, { useState, useEffect, useRef } from 'react';
import backgroundImage from './sky-background.avif';
const CitiesTable = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchedIndex, setLastFetchedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState({});
  const [suggestedCities, setSuggestedCities] = useState([]);
  const containerRef = useRef(null);
  const tableRef = useRef(null);

  const fetchMoreCities = async () => {
    console.log("scroll hit")
    if (
      containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 20 &&
      lastFetchedIndex <= cities.length
    ) {
      console.log("fetching more")
      setLoading(true);
      const response = await fetch(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=20&offset=${lastFetchedIndex}`)

      const data = await response.json();
      console.log(data)
      const newCities = data.results
      setCities(prevCities => [...prevCities, ...newCities]);
      setLastFetchedIndex(lastFetchedIndex => lastFetchedIndex + 20);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=20&offset=${lastFetchedIndex}`);
      const data = await response.json();
      console.log(data)
      const initialCities = data.results
      setCities(initialCities);
      setLoading(false);
      setLastFetchedIndex(20);
    };

    fetchData();
  }, []);

  useEffect(() => {
    containerRef.current.addEventListener('scroll', fetchMoreCities);
    return () => {
      containerRef.current.removeEventListener('scroll', fetchMoreCities);
    };
  }, [lastFetchedIndex, cities]);

  // Add scroll event listener to the container
  useEffect(() => {
    containerRef.current.addEventListener('scroll', fetchMoreCities);
    return () => {
      containerRef.current.removeEventListener('scroll', fetchMoreCities);
    };
  }, [lastFetchedIndex]); // Add lastFetchedIndex to dependency array to trigger effect when it changes

  // Function to filter cities based on the search term
  useEffect(() => {
    setFilteredCities(cities.filter(city => city.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, cities]);

  // Function to handle changes in the search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setSuggestedCities([]);
      return;
    }
    const suggestions = cities
      .filter(city => city.name.toLowerCase().startsWith(e.target.value.toLowerCase()))
      .slice(0, 5);
    setSuggestedCities(suggestions);
  };

  // Function to handle click on a suggested city
  const handleSuggestionClick = (cityName) => {
    setSearchTerm(cityName);
    setSuggestedCities([]);
  };

  // Function to handle sorting of cities
  const handleSort = (column) => {
    setSortOrder(prevOrder => ({
      [column]: prevOrder[column] === 'asc' ? 'desc' : 'asc'
    }));
    const sortedCities = [...filteredCities].sort((a, b) => {
      const valueA = typeof a[column] === 'string' ? a[column] : String(a[column]);
      const valueB = typeof b[column] === 'string' ? b[column] : String(b[column]);
      if (sortOrder[column] === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    setFilteredCities(sortedCities);
  };

  const handleCityClick = (geoname_id) => {
    window.location.href = `https://openweathermap.org/city/${geoname_id}`;
  };

  // Calculate the height of the container dynamically based on the viewport height
  const containerHeight = window.innerHeight - 64; // Subtracting the height of the header

  return (
    <div className="container mx-auto h-full" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', height: `${containerHeight}px`}}>
      <h1 className="text-2xl font-bold mb-4">Infinite scroll - Weather Forecast Web Application</h1>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search by city name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-3 border border-gray-400 rounded-md w-full bg-transparent placeholder-gray-500 text-white focus:outline-none focus:border-blue-500"
        />
        {suggestedCities.length > 0 && (
          <ul className="absolute bg-white  mt-1 w-full max-h-40 overflow-y-auto">
            {suggestedCities.map(city => (
              <li
                key={city.geoname_id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSuggestionClick(city.name)}
              >
                {city.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={containerRef} className="overflow-y-scroll h-full bg" style={{ scrollbarWidth: 'thin', scrollbarColor: 'grey grey' }}>
        <table className="min-w-full divide-y" ref={tableRef}>
          <thead className=" sticky top-0 z-10 bg-transparent" style={{ backdropFilter: 'blur(20px)' }}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-transparent" onClick={() => handleSort('name')} style={{ cursor: 'pointer'}}>City Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider" onClick={() => handleSort('cou_name_en')}style={{ cursor: 'pointer' }}>Country</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider" onClick={() => handleSort('timezone')} style={{ cursor: 'pointer' }}>Timezone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider" onClick={() => handleSort('population')} style={{ cursor: 'pointer' }}>Population</th>
            </tr>
          </thead>
          <tbody className=" bg-transparent border border-gray-400 rounded-md w-full" style={{ backdropFilter: 'blur(10px)', color: 'black', cursor: 'pointer' }}>
            {filteredCities.map(city => (
              <tr key={city.geoname_id} onClick={() => handleCityClick(city.geoname_id)}>
                <td className="px-6 py-4 whitespace-nowrap">{city.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{city.cou_name_en}</td>
                <td className="px-6 py-4 whitespace-nowrap">{city.timezone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{city.population}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {loading && <p>Loading...</p>}
      </div>
  );
};

export default CitiesTable;