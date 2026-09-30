import {
    Apple, Bird, Birdhouse, Candy, CandyCane, Cherry, Citrus, Clover, Drumstick, Flower, Flower2,
    Ghost, Gift, Grape, Ham, Heart, Leaf, Nut, Rose, Shell, Skull, Snowflake, Sparkle, Sparkles,
    Sprout, Squirrel, Star, TreePalm, TreePine, UtensilsCrossed, Wheat, type LucideIcon,
} from 'lucide-react'
import { MapleLeaf, Pumpkin, Spider, SpiderWeb } from './customIcons'

export type Watermark = {
    icon: LucideIcon
    className: string
}

export type SeasonalTheme = {
    background: string
    header: string
    watermarks: Watermark[]
}

// Each watermark's className holds everything unique to it: position, size, rotation,
// and color with its own `/` opacity. Classes are written out in full so Tailwind can
// find them. Colors are @theme tokens in index.css (--color-{month}-bg/-header/-icon...).

const januaryTheme: SeasonalTheme = {
    background: 'bg-jan-bg',
    header: 'bg-jan-header',
    watermarks: [
        { icon: Snowflake, className: 'right-[400px] bottom-[-41px] w-[221px] h-[221px] rotate-[8deg] text-jan-icon/20' },
        { icon: Snowflake, className: 'right-[170px] bottom-[71px] w-[105px] h-[105px] rotate-[-12deg] text-jan-icon/15' },
        { icon: Snowflake, className: 'right-[48px] bottom-[207px] w-[71px] h-[71px] rotate-[20deg] text-jan-icon/15' },
        { icon: Snowflake, className: 'right-[298px] bottom-[230px] w-[125px] h-[125px] rotate-[20deg] text-jan-icon/10' },
    ]
}

const februaryTheme: SeasonalTheme = {
    background: 'bg-feb-bg',
    header: 'bg-feb-header',
    watermarks: [
        { icon: Rose, className: 'right-[-31px] bottom-[-27px] w-[238px] h-[238px] text-feb-icon/20' },
        { icon: Heart, className: 'left-[-10px] bottom-[-7px] w-[78px] h-[78px] rotate-[-12deg] text-feb-icon/15' },
        { icon: Heart, className: 'left-[68px] bottom-[61px] w-[54px] h-[54px] rotate-[14deg] text-feb-icon/15' },
    ]
}

const marchTheme: SeasonalTheme = {
    background: 'bg-mar-bg',
    header: 'bg-mar-header',
    watermarks: [
        { icon: Clover, className: 'right-[394px] bottom-[-37px] w-[211px] h-[211px] rotate-[8deg] text-mar-icon/20' },
        { icon: Clover, className: 'right-[170px] bottom-[75px] w-[99px] h-[99px] rotate-[-18deg] text-mar-icon/15' },
        { icon: Clover, className: 'right-[44px] bottom-[204px] w-[68px] h-[68px] rotate-[22deg] text-mar-icon/15' },
    ]
}

const aprilTheme: SeasonalTheme = {
    background: 'bg-apr-bg',
    header: 'bg-apr-header',
    watermarks: [
        { icon: Flower, className: 'right-[-34px] bottom-[-41px] w-[221px] h-[221px] rotate-[10deg] text-apr-icon/20' },
        { icon: Flower, className: 'right-[163px] bottom-[68px] w-[109px] h-[109px] rotate-[-15deg] text-apr-icon/15' },
        { icon: Flower, className: 'right-[51px] bottom-[201px] w-[75px] h-[75px] rotate-[25deg] text-apr-icon/15' },
    ]
}

const mayTheme: SeasonalTheme = {
    background: 'bg-may-bg',
    header: 'bg-may-header',
    watermarks: [
        // paired: bird sits on this roof
        { icon: Birdhouse, className: 'right-[-10px] bottom-[-17px] w-[211px] h-[211px] text-may-icon/20' },
        // paired: perched on the birdhouse roof
        { icon: Bird, className: 'right-[65px] bottom-[163px] w-[95px] h-[95px] text-may-icon2/20' },
        { icon: Sprout, className: 'left-[-7px] bottom-[-7px] w-[82px] h-[82px] text-may-icon3/15' },
        { icon: Flower2, className: 'left-[75px] bottom-[-7px] w-[75px] h-[75px] text-may-icon4/15' },
    ]
}

const juneTheme: SeasonalTheme = {
    background: 'bg-jun-bg',
    header: 'bg-jun-header',
    watermarks: [
        { icon: TreePalm, className: 'right-[-24px] bottom-[-20px] w-[238px] h-[238px] text-jun-icon/20' },
        { icon: Shell, className: 'left-[-7px] bottom-[-7px] w-[88px] h-[88px] rotate-[-10deg] text-jun-icon2/20' },
        { icon: Star, className: 'left-[88px] bottom-[7px] w-[68px] h-[68px] rotate-[18deg] text-jun-icon3/20' },
    ]
}

const julyTheme: SeasonalTheme = {
    background: 'bg-jul-bg',
    header: 'bg-jul-header',
    watermarks: [
        { icon: Sparkles, className: 'right-[-24px] bottom-[-20px] w-[204px] h-[204px] text-jul-icon/30' },
        { icon: Sparkle, className: 'right-[170px] bottom-[85px] w-[112px] h-[112px] rotate-[15deg] text-jul-icon2/30' },
        { icon: Sparkle, className: 'right-[44px] bottom-[201px] w-[75px] h-[75px] rotate-[-10deg] text-jul-icon3/40' },
        { icon: Sparkle, className: 'left-[-10px] bottom-[-10px] w-[88px] h-[88px] rotate-[8deg] text-jul-icon3/40' },
        { icon: Sparkle, className: 'left-[85px] bottom-[75px] w-[54px] h-[54px] rotate-[-15deg] text-jul-icon4/30' },
    ]
}

const augustTheme: SeasonalTheme = {
    background: 'bg-aug-bg',
    header: 'bg-aug-header',
    watermarks: [
        { icon: Citrus, className: 'right-[-20px] bottom-[-20px] w-[190px] h-[190px] text-aug-icon/25' },
        { icon: Grape, className: 'right-[177px] bottom-[-10px] w-[105px] h-[105px] rotate-[-10deg] text-aug-icon2/20' },
        { icon: Apple, className: 'right-[51px] bottom-[177px] w-[78px] h-[78px] rotate-[8deg] text-aug-icon3/20' },
        { icon: Cherry, className: 'left-[-7px] bottom-[-7px] w-[92px] h-[92px] text-aug-icon3/20' },
        { icon: Citrus, className: 'left-[92px] bottom-[-7px] w-[78px] h-[78px] rotate-[140deg] text-aug-icon4/30' },
    ]
}

const septemberTheme: SeasonalTheme = {
    background: 'bg-sep-bg',
    header: 'bg-sep-header',
    watermarks: [
        { icon: Squirrel, className: 'right-[-14px] bottom-[-14px] w-[197px] h-[197px] text-sep-icon2/20' },
        { icon: Nut, className: 'right-[201px] bottom-[-3px] w-[68px] h-[68px] text-sep-icon2/20' },
        { icon: MapleLeaf, className: 'right-[44px] bottom-[184px] w-[85px] h-[85px] rotate-[20deg] text-sep-icon3/20' },
        { icon: MapleLeaf, className: 'left-[-14px] bottom-[-14px] w-[99px] h-[99px] rotate-[-25deg] text-sep-icon/20' },
        { icon: Nut, className: 'left-[95px] bottom-[0px] w-[58px] h-[58px] rotate-[10deg] text-sep-icon2/20' },
        { icon: MapleLeaf, className: 'left-[68px] bottom-[112px] w-[58px] h-[58px] rotate-[15deg] text-sep-icon4/25' },
    ]
}

const octoberTheme: SeasonalTheme = {
    background: 'bg-oct-bg',
    header: 'bg-oct-header',
    watermarks: [
        { icon: SpiderWeb, className: 'left-[-75px] bottom-[-75px] w-[204px] h-[204px] text-oct-icon4/10' },
        { icon: SpiderWeb, className: 'left-[-25px] bottom-[386px] w-[102px] h-[102px] text-oct-icon4/10' },
        { icon: Spider, className: 'left-[0px] bottom-[347px] w-[65px] h-[65px] text-oct-icon4/20' },
        { icon: Ghost, className: 'right-[-24px] bottom-[-24px] w-[204px] h-[204px] text-oct-icon/50' },
        { icon: Pumpkin, className: 'right-[167px] bottom-[-14px] w-[112px] h-[112px] text-oct-icon3/30' },
        { icon: Skull, className: 'right-[41px] bottom-[184px] w-[71px] h-[71px] rotate-[-8deg] text-oct-icon4/15' },
        { icon: Candy, className: 'left-[112px] bottom-[-3px] w-[68px] h-[68px] text-oct-icon2/20' },
    ]
}

const novemberTheme: SeasonalTheme = {
    background: 'bg-nov-bg',
    header: 'bg-nov-header',
    watermarks: [
        { icon: Ham, className: 'right-[-20px] bottom-[-20px] w-[204px] h-[204px] text-nov-icon/20' },
        { icon: Drumstick, className: 'right-[184px] bottom-[-7px] w-[99px] h-[99px] text-nov-icon2/20' },
        { icon: Leaf, className: 'right-[44px] bottom-[190px] w-[65px] h-[65px] rotate-[30deg] text-nov-icon2/20' },
        { icon: UtensilsCrossed, className: 'left-[-7px] bottom-[-7px] w-[88px] h-[88px] text-nov-icon3/20' },
        { icon: Wheat, className: 'left-[92px] bottom-[-3px] w-[75px] h-[75px] text-nov-icon4/25' },
    ]
}

const decemberTheme: SeasonalTheme = {
    background: 'bg-dec-bg',
    header: 'bg-dec-header',
    watermarks: [
        // paired: star sits on this tip
        { icon: TreePine, className: 'right-[-17px] bottom-[-20px] w-[224px] h-[224px] text-dec-icon/25' },
        // paired: rests on the tree tip
        { icon: Star, className: 'right-[70px] bottom-[175px] w-[51px] h-[51px] text-dec-icon3/45' },
        { icon: Gift, className: 'right-[190px] bottom-[-7px] w-[78px] h-[78px] text-dec-icon2/20' },
        { icon: Gift, className: 'right-[258px] bottom-[-3px] w-[58px] h-[58px] text-dec-icon/20' },
        { icon: CandyCane, className: 'left-[-7px] bottom-[-7px] w-[88px] h-[88px] text-dec-icon2/20' },
        { icon: Snowflake, className: 'left-[88px] bottom-[119px] w-[51px] h-[51px] rotate-[15deg] text-dec-icon4/70' },
        { icon: Snowflake, className: 'left-[24px] bottom-[184px] w-[37px] h-[37px] rotate-[-10deg] text-dec-icon4/70' },
    ]
}

const monthArray: SeasonalTheme[] = [januaryTheme, februaryTheme, marchTheme, aprilTheme, mayTheme, juneTheme, julyTheme, augustTheme, septemberTheme, octoberTheme, novemberTheme, decemberTheme]

export function getDefaultSeasonalTheme(month: number): SeasonalTheme {
    return monthArray[month - 1]
}
