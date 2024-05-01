import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import exec from 'k6/execution';
import { Counter, Trend } from 'k6/metrics';

let myCounter = new Counter('my_counter');
let newsPageResponseTrend = new Trend('response_time_news_page');

export let options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        http_req_duration: ['p(95)<100'],
        http_req_duration: ['avg<50'],
        http_req_duration: ['max<200'],
        http_req_failed: ['rate<0.01'],
        http_reqs: ['count>40'],
        vus: ['value>1'],
        checks: ['rate>=0.98'],
        my_counter: ['count>5'],
        response_time_news_page: ['p(95)<100']
    }
};

export default function () {
    let res = http.get('http://test.k6.io/' + (exec.scenario.iterationInTest === 1 ? 'foo' : '')); // 1st iteration: http://test.k6.io/foo, 2nd iteration: http://test.k6.io
    // console.log(exec.scenario.iterationInTest);
    myCounter.add(1);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page is startpage': (r) => r.body.includes('Collection of simple web-pages'),
        'transaction time OK': (r) => r.timings.duration < 200
    });

    sleep(1);

    res = http.get('http://test.k6.io/news.php');
    newsPageResponseTrend.add(res.timings.duration);

    sleep(1);
}