import Image from 'next/image'
export default function Footer({build}) {
    return (
        <footer className="p-10 footer bg-base-200 text-base-content">
            <div className="flex items-end">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="https://img.icons8.com/clouds/500/000000/fortune-teller.png" style={{height: '150px'}}/>
                {/* <p className="pb-6">今日运势 {build}</p> */}
            </div>
            <div>
                <span className="footer-title">referal</span>
                <a href="https://icons8.com/icon/6AqXMrgaiWZB/osu">Osu icon by Icons8</a>
                <a href="https://icons8.com/icon/hUmiwR_HY5yT/fortune-teller">Fortune Teller icon by Icons8</a>
                <a href="https://icons8.com/icon/113580/today">Today icon by Icons8</a>
                <a href="https://icons8.com/icon/L8u73GfZ6PD4/opacity">Opacity icon by Icons8</a>
                <a href="https://icons8.com/icon/L8u73GfZ6PD4/null-symbol">NULL symbol icon by Icons8</a>
                <a href="https://icons8.com/icon/5oXrOLQ6Ke4m/shark">Shark icon by Icons8</a>
                <a href="https://icons8.com/icon/Qq-wIvIEHrlY/osu-lazer">Osu Lazer icon by Icons8</a>
            </div>
            <div>
                <span className="footer-title">-</span>
                <a href="https://icons8.com/icon/124080/fast-forward">Fast Forward icon by Icons8</a>
                <a href="https://icons8.com/icon/112292/light-on">Light On icon by Icons8</a>
                <a href="https://icons8.com/icon/105352/christmas-candy">Christmas Candy icon by Icons8</a>
                <a href="https://icons8.com/icon/64276/drink-time">Drink Time icon by Icons8</a>
                <a href="https://icons8.com/icon/63951/float">Float icon by Icons8</a>
                <a href="https://icons8.com/icon/113648/good-quality">Good Quality icon by Icons8</a>
                <a href="https://icons8.com/icon/ReZIblLDDfYQ/futurama-bender">Futurama Bender icon by Icons8</a>
            </div>
            {/* <div>
                <span className="footer-title">Legal</span>
                <a className="link link-hover">Terms of use</a>
                <a className="link link-hover">Privacy policy</a>
                <a className="link link-hover">Cookie policy</a>
            </div> */}
        </footer>
    )
}

export async function getServerSideProps () {
    const bid = require('../next.config').generateBuildId
    const build = `b${await bid()}`
    return {props: {build}}
}