import { useRef, useState, useEffect } from 'react'
import * as d3 from 'd3'
import Chart from 'react-google-charts'
import './App.css'

function App() {
    const options = { width: 600, height: 600 }
    const [data, setData] = useState([])

    useEffect(() => {
        d3.csv('energy.csv').then((data) => {
            let temp = []
            temp.push(['From', 'To', 'Weight'])
            data.map((d) => {
                temp.push([d.source, d.target, Number(d.value)])
            })
            setData(temp)
        })
    }, [])

    console.log(data, 'data')

    return (
        <div className="App">
            <Chart
                loader={<div>Loading!!!</div>}
                chartType="Sankey"
                width="40%"
                height="200px"
                data={data}
                options={options}
            />
        </div>
    )
}

export default App
