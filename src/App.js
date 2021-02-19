import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as d3_sankey from 'd3-sankey'

export default function App() {
    let d = [
        { letter: 'A', frequency: 0.08167 },
        { letter: 'B', frequency: 0.01492 },
        { letter: 'C', frequency: 0.02782 },
        { letter: 'D', frequency: 0.04253 },
        { letter: 'E', frequency: 0.12702 },
        { letter: 'F', frequency: 0.02288 },
        { letter: 'G', frequency: 0.02015 },
        { letter: 'H', frequency: 0.06094 },
        { letter: 'I', frequency: 0.06966 },
        { letter: 'J', frequency: 0.00153 },
        { letter: 'K', frequency: 0.00772 },
        { letter: 'L', frequency: 0.04025 },
        { letter: 'M', frequency: 0.02406 },
        { letter: 'N', frequency: 0.06749 },
        { letter: 'O', frequency: 0.07507 },
        { letter: 'P', frequency: 0.01929 },
        { letter: 'Q', frequency: 0.00095 },
        { letter: 'R', frequency: 0.05987 },
        { letter: 'S', frequency: 0.06327 },
        { letter: 'T', frequency: 0.09056 },
        { letter: 'U', frequency: 0.02758 },
        { letter: 'V', frequency: 0.00978 },
        { letter: 'W', frequency: 0.0236 },
        { letter: 'X', frequency: 0.0015 },
        { letter: 'Y', frequency: 0.01974 },
        { letter: 'Z', frequency: 0.00074 },
    ]
    const svgRef = useRef()
    let canvas = useRef()
    const [data, setData] = useState(d)

    useEffect(() => {
        let context = canvas.getContext('2d')

        let margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = canvas.width - margin.left - margin.right,
            height = canvas.height - margin.top - margin.bottom

        let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)

        let y = d3.scaleLinear().rangeRound([height, 0])

        context.translate(margin.left, margin.top)

        x.domain(data.map((d) => d.letter))
        y.domain([0, d3.max(data, (d) => d.frequency)])

        let yTickCount = 10,
            yTicks = y.ticks(yTickCount),
            yTickFormat = y.tickFormat(yTickCount, '%')

        context.beginPath()
        x.domain().forEach((d) => {
            context.moveTo(x(d) + x.bandwidth() / 2, height)
            context.lineTo(x(d) + x.bandwidth() / 2, height + 6)
        })
        context.strokeStyle = 'black'
        context.stroke()

        context.textAlign = 'center'
        context.textBaseline = 'top'
        x.domain().forEach((d) => {
            context.fillText(d, x(d) + x.bandwidth() / 2, height + 6)
        })

        context.beginPath()
        yTicks.forEach((d) => {
            context.moveTo(0, y(d) + 0.5)
            context.lineTo(-6, y(d) + 0.5)
        })
        context.strokeStyle = 'black'
        context.stroke()

        context.textAlign = 'right'
        context.textBaseline = 'middle'
        yTicks.forEach((d) => {
            context.fillText(yTickFormat(d), -9, y(d))
        })

        context.beginPath()
        context.moveTo(-6.5, 0 + 0.5)
        context.lineTo(0.5, 0 + 0.5)
        context.lineTo(0.5, height + 0.5)
        context.lineTo(-6.5, height + 0.5)
        context.strokeStyle = 'black'
        context.stroke()

        context.save()
        context.rotate(-Math.PI / 2)
        context.textAlign = 'right'
        context.textBaseline = 'top'
        context.font = 'bold 10px sans-serif'
        context.fillText('Frequency', -10, 10)
        context.restore()

        context.fillStyle = 'steelblue'
        data.forEach((d) => {
            context.fillRect(
                x(d.letter),
                y(d.frequency),
                x.bandwidth(),
                height - y(d.frequency)
            )
        })
    }, [])

    useEffect(() => {
        let width = 775
        let height = 400

        d3.csv('titanic.csv', d3.autoType).then((data) => {
            let keys = data.columns.slice(0, -1)
            let color = d3
                .scaleOrdinal(['Perished'], ['#da4f81'])
                .unknown('#cccccc')

            // -----------------

            let graph = () => {
                let index = -1
                const nodes = []
                const nodeByKey = new Map()
                const indexByKey = new Map()
                const links = []

                for (const k of keys) {
                    for (const d of data) {
                        const key = JSON.stringify([k, d[k]])
                        console.log(key, 'key')
                        if (nodeByKey.has(key)) continue
                        const node = { name: d[k] }
                        nodes.push(node)
                        nodeByKey.set(key, node)
                        indexByKey.set(key, ++index)
                    }
                }

                for (let i = 1; i < keys.length; ++i) {
                    const a = keys[i - 1]
                    const b = keys[i]
                    const prefix = keys.slice(0, i + 1)
                    const linkByKey = new Map()
                    for (const d of data) {
                        const names = prefix.map((k) => d[k])
                        const key = JSON.stringify(names)
                        const value = d.value || 1
                        let link = linkByKey.get(key)
                        if (link) {
                            link.value += value
                            continue
                        }
                        link = {
                            source: indexByKey.get(JSON.stringify([a, d[a]])),
                            target: indexByKey.get(JSON.stringify([b, d[b]])),
                            names,
                            value,
                        }
                        links.push(link)
                        linkByKey.set(key, link)
                    }
                }

                return { nodes, links }
            }

            // -----------------

            let sankey = d3_sankey
                .sankey()
                .nodeSort(null)
                .linkSort(null)
                .nodeWidth(4)
                .nodePadding(20)
                .extent([
                    [0, 5],
                    [width, height - 5],
                ])

            console.log('sankey: ', sankey)
            console.log(graph().nodes, 'nodes')
            console.log(graph().links, 'links')

            // -----------------

            let chart = () => {
                const svg = d3
                    .select(svgRef.current)
                    .attr('viewBox', [0, 0, width, height])

                const { nodes, links } = sankey({
                    nodes: graph().nodes.map((d) => Object.assign({}, d)),
                    links: graph().links.map((d) => Object.assign({}, d)),
                })

                svg.append('g')
                    .selectAll('rect')
                    .data(nodes)
                    .join('rect')
                    .attr('x', (d) => {
                        return d.x0
                    })
                    .attr('y', (d) => {
                        return d.y0
                    })
                    .attr('height', (d) => d.y1 - d.y0)
                    .attr('width', (d) => d.x1 - d.x0 + 5)
                    .append('title')
                    .text((d) => `${d.name}\n${d.value.toLocaleString()}`)

                svg.append('g')
                    .attr('fill', 'none')
                    .selectAll('g')
                    .data(links)
                    .join('path')
                    .attr('d', d3_sankey.sankeyLinkHorizontal())
                    .attr('stroke', (d) => color(d.names[0]))
                    .attr('stroke-width', (d) => d.width)
                    .on('mouseover', function (d, i) {
                        d3.select(this)
                            .transition()
                            .duration('50')
                            .attr('opacity', '.6')
                    })
                    .on('mouseout', function (d, i) {
                        d3.select(this)
                            .transition()
                            .duration('50')
                            .attr('opacity', '1')
                    })
                    .style('mix-blend-mode', 'multiply')
                    .append('title')
                    .text(
                        (d) =>
                            `${d.names.join(
                                ' → '
                            )}\n${d.value.toLocaleString()}`
                    )

                svg.append('g')
                    .style('font', '10px sans-serif')
                    .selectAll('text')
                    .data(nodes)
                    .join('text')
                    .attr('x', (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
                    .attr('y', (d) => (d.y1 + d.y0) / 2)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', (d) =>
                        d.x0 < width / 2 ? 'start' : 'end'
                    )
                    .text((d) => d.name)
                    .append('tspan')
                    .attr('fill-opacity', 0.7)
                    .text((d) => ` ${d.value.toLocaleString()}`)

                return svg.node()
            }
            chart()
        })
    }, [])

    return (
        <div>
            <svg ref={svgRef} />
            <canvas ref={(el) => (canvas = el)} />
        </div>
    )
}
