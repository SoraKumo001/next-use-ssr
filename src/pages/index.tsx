import { Suspense, use } from 'react';
import { usePromiseState } from '../libs/promiseState';

export interface WeatherType {
  publishingOffice: string;
  reportDatetime: string;
  targetArea: string;
  headlineText: string;
  text: string;
}

const fetchWeather = (id: number): Promise<WeatherType> =>
  fetch(`https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${id}.json`)
    .then((r) => r.json())
    .then(
      //ウエイト追加
      (r) => new Promise((resolve) => setTimeout(() => resolve(r), 1000))
    );

const Weather = ({ weather: p }: { weather: Promise<WeatherType> }) => {
  //Reactの新機能useでデータを取り出す
  const weather = use(p);
  return (
    <div>
      <h1>{weather.targetArea}</h1>
      <div>
        {new Date(weather.reportDatetime).toLocaleString('ja-JP', {
          timeZone: 'JST',
          year: 'numeric',
          month: 'narrow',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </div>
      <div>{weather.headlineText}</div>
      <pre>{weather.text}</pre>
    </div>
  );
};

const Page = () => {
  //初期値はcallbackで渡す
  const [weather, setWeather] = usePromiseState(() => fetchWeather(130000));
  return (
    <div>
      <div>
        <a href="https://github.com/SoraKumo001/next-use-ssr">Source Code</a>
      </div>
      <hr />
      <div>
        {/* 後からstateを変更する場合は、そのままpromiseを格納してOK */}
        <button onClick={() => setWeather(fetchWeather(130000))}>東京</button>
        <button onClick={() => setWeather(fetchWeather(120000))}>千葉</button>
        <button onClick={() => setWeather(fetchWeather(140000))}>神奈川</button>
      </div>
      <Suspense fallback={'Loading'}>
        <Weather weather={weather} />
      </Suspense>
    </div>
  );
};
export default Page;
