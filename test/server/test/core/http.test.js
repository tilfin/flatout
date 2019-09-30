import { HttpClient } from '/lib/core/http.js';

export default describe('HttpClient', () => {
  let http;

  beforeEach(() => {
    http = new HttpClient()
  })

  describe("#get", () => {
    it("succeeds", async () => {
      const res = await http.get('/httptest');
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('GET');
    })

    it("succeeds with query", async () => {
      const res = await http.get('/httptest', {
        query: { num: 1, str: 'str', bool: true }
      });
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('GET');
      expect(res.body.contentType).to.eq('application/json;charset=UTF-8');
      expect(res.body.query).to.deep.eq({ num: '1', str: 'str', bool: 'true' });
    })

    it("throws an error by Not Found", async () => {
      try {
        await http.get('/httptest/404');  
      } catch(err) {
        expect(err.isNotFound).to.be.true;
        expect(err.req.path).to.eq('/httptest/404')
        expect(err.res.body.method).to.eq('GET');
      }
    })
  })

  describe("#post", () => {
    it("succeeds", async () => {
      const res = await http.post('/httptest');
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('POST');
    })

    it("succeeds with query and body", async () => {
      const res = await http.post('/httptest', {
        query: { key: 'value' },
        body: { num: 1, str: 'str', bool: true },
      });
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('POST');
      expect(res.body.query).to.deep.eq({ key: 'value' });
      expect(res.body.contentType).to.eq('application/json;charset=UTF-8');
      expect(res.body.body).to.deep.eq({ num: 1, str: 'str', bool: true });
    })

    it("throws an error by Bad Request", async () => {
      try {
        await http.post('/httptest/400');  
      } catch(err) {
        expect(err.isBadRequest).to.be.true;
        expect(err.res.body.method).to.eq('POST');
      }
    })
  })

  describe("#put", () => {
    it("succeeds", async () => {
      const res = await http.put('/httptest');
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('PUT');
    })

    it("succeeds with query and body", async () => {
      const res = await http.put('/httptest', {
        query: { key: 'value' },
        body: { num: 1, str: 'str', bool: true },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('PUT');
      expect(res.body.query).to.deep.eq({ key: 'value' });
      expect(res.body.contentType).to.eq('application/x-www-form-urlencoded');
      expect(res.body.body).to.deep.eq({ num: '1', str: 'str', bool: 'true' });
    })

    it("throws an error by Forbidden", async () => {
      try {
        await http.put('/httptest/403');  
      } catch(err) {
        expect(err.isForbidden).to.be.true;
        expect(err.res.status).to.eq(403);
        expect(err.res.body.method).to.eq('PUT');
      }
    })
  })

  describe("#patch", () => {
    it("succeeds", async () => {
      const res = await http.patch('/httptest');
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('PATCH');
    })

    it("succeeds with query and body", async () => {
      const res = await http.patch('/httptest', {
        query: { key: 'value' },
        body: { num: 1, str: 'str', bool: true },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('PATCH');
      expect(res.body.query).to.deep.eq({ key: 'value' });
      expect(res.body.contentType).to.match(/^multipart\/form-data; boundary=/);
      expect(res.body.body).to.deep.eq({ num: '1', str: 'str', bool: 'true' });
    })

    it("throws an error by Unprocessable Entity", async () => {
      try {
        await http.patch('/httptest/422');
      } catch(err) {
        expect(err.res.status).to.eq(422);
        expect(err.res.body.method).to.eq('PATCH');
      }
    })
  })

  describe("#delete", () => {
    it("succeeds", async () => {
      const res = await http.delete('/httptest');
      expect(res.body.method).to.eq('DELETE');
    })

    it("succeeds with query and custom header", async () => {
      const res = await http.delete('/httptest', {
        query: { key: 'value' },
        headers: {
          'X-Api-Key': 'dummykey'
        }
      });
      expect(res.status).to.eq(200);
      expect(res.body.method).to.eq('DELETE');
      expect(res.body.query).to.deep.eq({ key: 'value' });
      expect(res.body.headers['x-api-key']).to.eq('dummykey');
    })

    it("succeeds by No Content", async () => {
      const res = await http.delete('/httptest/204');
      expect(res.status).to.eq(204);
    })

    it("throws an error by Server Error", async () => {
      try {
        await http.patch('/httptest/500');
      } catch(err) {
        expect(err.isServerError).to.be.true;
        expect(err.res.status).to.eq(500);
      }
    })
  })
})
