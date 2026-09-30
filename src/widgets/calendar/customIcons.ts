import { createLucideIcon } from 'lucide-react'

// Icons Lucide doesn't have. Drawn on Lucide's 24x24 grid with its 2px round-capped
// outline style, and built with createLucideIcon so they behave exactly like
// Lucide icons (className, LucideIcon type).

export const MapleLeaf = createLucideIcon('maple-leaf', [
    ['path', { d: 'M12 2 13.4 4.8 15 4.2 14.4 8.6 17.2 6.2 17.8 7.8 20.6 7.2 19.6 10.4 21 11.2 16.4 15 16.9 16.6 12 15.9 7.1 16.6 7.6 15 3 11.2 4.4 10.4 3.4 7.2 6.2 7.8 6.8 6.2 9.6 8.6 9 4.2 10.6 4.8Z', key: 'leaf' }],
    ['path', { d: 'M12 15.9V22', key: 'stem' }],
])

export const Pumpkin = createLucideIcon('pumpkin', [
    ['path', { d: 'M12 7c-5 0-9 3-9 7s4 7 9 7 9-3 9-7-4-7-9-7Z', key: 'body' }],
    ['path', { d: 'M12 7c-2.2 0-4 3.1-4 7s1.8 7 4 7', key: 'rib-left' }],
    ['path', { d: 'M12 7c2.2 0 4 3.1 4 7s-1.8 7-4 7', key: 'rib-right' }],
    ['path', { d: 'M12 7V4a2 2 0 0 1 2-2', key: 'stem' }],
    ['path', { d: 'M13 4.5c1.4-.6 2.9-.1 3.5 1.3', key: 'vine' }],
])

export const Spider = createLucideIcon('spider', [
    ['path', { d: 'M12 2v5', key: 'thread' }],
    ['circle', { cx: '12', cy: '9', r: '2', key: 'head' }],
    ['circle', { cx: '12', cy: '15', r: '4', key: 'body' }],
    ['path', { d: 'M10.3 10.5 7 7.5 5 8.5', key: 'leg-l1' }],
    ['path', { d: 'M8.4 13.5 5 12 3 13.5', key: 'leg-l2' }],
    ['path', { d: 'M8.2 16 5 17 3.5 19.5', key: 'leg-l3' }],
    ['path', { d: 'M9.5 18.2 7.5 20.5 7 22', key: 'leg-l4' }],
    ['path', { d: 'M13.7 10.5 17 7.5 19 8.5', key: 'leg-r1' }],
    ['path', { d: 'M15.6 13.5 19 12 21 13.5', key: 'leg-r2' }],
    ['path', { d: 'M15.8 16 19 17 20.5 19.5', key: 'leg-r3' }],
    ['path', { d: 'M14.5 18.2 16.5 20.5 17 22', key: 'leg-r4' }],
])

export const SpiderWeb = createLucideIcon('spider-web', [
    ['path', { d: 'M12 2v20', key: 'spoke-v' }],
    ['path', { d: 'M2 12h20', key: 'spoke-h' }],
    ['path', { d: 'M4.93 4.93 19.07 19.07', key: 'spoke-d1' }],
    ['path', { d: 'M19.07 4.93 4.93 19.07', key: 'spoke-d2' }],
    ['path', { d: 'M12 4Q14.6 5.72 17.66 6.34Q18.28 9.4 20 12Q18.28 14.6 17.66 17.66Q14.6 18.28 12 20Q9.4 18.28 6.34 17.66Q5.72 14.6 4 12Q5.72 9.4 6.34 6.34Q9.4 5.72 12 4', key: 'ring-outer' }],
    ['path', { d: 'M12 8Q13.3 8.86 14.83 9.17Q15.14 10.7 16 12Q15.14 13.3 14.83 14.83Q13.3 15.14 12 16Q10.7 15.14 9.17 14.83Q8.86 13.3 8 12Q8.86 10.7 9.17 9.17Q10.7 8.86 12 8', key: 'ring-inner' }],
])
