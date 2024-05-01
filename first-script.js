import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

export let options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        http_req_duration: ['p(95)<100'],
        http_req_failed: ['rate<0.01']
    }
};

export default function () {
    http.get('http://test.k6.io');

    check(http.get('http://test.k6.io'), {
        'status is 200': (r) => r.status === 200,
        'page is startpage': (r) => r.body.includes('Collection of simple web-pages')
    });

    sleep(1);
}