import Core from '/lib/core/core.js';

export default describe('Core', () => {
  let core;

  beforeEach(() => {
    core = new Core()
  })

  describe("#listen", () => {
    it("adds a handler for a name", () => {
      const handler = () => {};
      core.listen('name', handler);
      expect(core._F_obs.get('name')).to.include(handler);
    })

    it("adds a handler for each name at once", () => {
      const handlerA = () => {};
      const handlerB = () => {};
      core.listen({ nameA: handlerA, nameB: handlerB });
      expect(core._F_obs.get('nameA')).to.include(handlerA);
      expect(core._F_obs.get('nameB')).to.include(handlerB);
    })

    it("adds a handler for any names", () => {
      const handler = () => {};
      core.listen({ nameA: handler, nameB: handler });
      expect(core._F_obs.get('nameA')).to.include(handler);
      expect(core._F_obs.get('nameB')).to.include(handler);
    })

    it("adds handlers for a name", () => {
      const handlerA = () => {};
      const handlerB = () => {};
      core.listen('nameC', handlerA);
      expect(core._F_obs.get('nameC')).to.include(handlerA);
      core.listen('nameC', handlerB);
      expect(core._F_obs.get('nameC')).to.include(handlerA);
      expect(core._F_obs.get('nameC')).to.include(handlerB);
    })
  })

  describe("#unlisten", () => {
    const nameA = 'nameA';
    const nameB = 'nameB';
    const handlerA1 = () => {};
    const handlerA2 = () => {};
    const handlerB = () => {};

    beforeEach(() => {
      core.listen(nameA, handlerA1);
      core.listen(nameA, handlerA2);
      core.listen(nameB, handlerB);
    })

    it("removes a handler for a name", () => {
      core.unlisten(nameB, handlerB);
      expect(core._F_obs.get(nameB)).not.to.include(handlerB);
      expect(core._F_obs.get(nameA)).to.include(handlerA1); // not affect
    })

    it("removes each handler for a name", () => {
      core.unlisten(nameA, handlerA1);
      expect(core._F_obs.get(nameA)).not.to.include(handlerA1);
      expect(core._F_obs.get(nameA)).to.include(handlerA2); // remain
      core.unlisten(nameA, handlerA2);
      expect(core._F_obs.get(nameA)).not.to.include(handlerA2);
      expect(core._F_obs.get(nameB)).to.include(handlerB); // not affect
    })
  })

  describe("#say", () => {
    const context = { foo: 1 };
    const nameA = 'nameA';
    const nameB = 'nameB';
    let handlerA1;
    let handlerA2;
    let handlerB;

    beforeEach(() => {
      handlerA1 = chai.spy();
      handlerA2 = chai.spy();
      handlerB = chai.spy();
      core.listen(nameA, handlerA1);
      core.listen(nameA, handlerA2);
      core.listen(nameB, handlerB);
    })

    it("cast a message", () => {
      core.say(nameA);
      expect(handlerA1).to.have.been.called.once;
      expect(handlerA2).to.have.been.called.once;
      expect(handlerB).to.have.not.been.called;
    })

    it("cast a message multiple times", () => {
      core.say(nameA);
      core.say(nameA);
      expect(handlerA1).to.have.been.called.twice;
      expect(handlerA2).to.have.been.called.twice;
      expect(handlerB).to.have.not.been.called;
    })

    it("cast a message with context", () => {
      core.say(nameA, context);
      expect(handlerA1).to.have.been.called.with(context);
      expect(handlerA2).to.have.been.called.with(context);
      expect(handlerB).to.have.not.been.called;
    })
  })

  describe("#unescapeHtml", () => {
    it("reverts escaped HTML tags", () => {
      expect(core.unescapeHtml("&lt;b&gt;tilfin&apos;s note&lt;/b&gt;")).to.eq("<b>tilfin's note</b>")
    })
  })

  describe("#_callR", () => {
    it("call with args, target and method recursively", () => {
      const childA = new Core();
      const childB = new Core();
      core['anyTarget'] = { childA, childB };
      core.foo = chai.spy();
      core.bar = chai.spy();
      childA.foo = chai.spy();
      childB.bar = chai.spy();

      const args = [1, 'A'];
      core._callR(args, 'anyTarget', 'foo');
      expect(core.foo).to.have.been.called.with(...args);
      expect(core.bar).to.have.not.been.called;
      expect(childA.foo).to.have.been.called.with(...args);
      expect(childB.bar).to.have.not.been.called;
    })
  })

  describe("#_isStr", () => {
    it("returns that target is a string or not", () => {
      expect(core._isStr('string')).to.be.true;
      expect(core._isStr('')).to.be.true;
      expect(core._isStr(function(){})).to.be.false;
      expect(core._isStr(1)).to.be.false;
      expect(core._isStr(false)).to.be.false;
      expect(core._isStr(null)).to.be.false;
      expect(core._isStr(undefined)).to.be.false;
    })
  })

  describe("#_isFn", () => {
    it("returns that target is a function or not", () => {
      expect(core._isFn(function(){})).to.be.true;
      expect(core._isFn('string')).to.be.false;
      expect(core._isFn(1)).to.be.false;
      expect(core._isFn(false)).to.be.false;
      expect(core._isFn(null)).to.be.false;
      expect(core._isFn(undefined)).to.be.false;
    })
  })
})
