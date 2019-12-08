import FormView from '/lib/view/form-view.js';

describe('FormView', () => {
  let domView;

  beforeEach(() => {
    const t = document.querySelector('#fixtureForm')
    const clone = document.importNode(t.content, true)
    domView = clone.firstElementChild
    document.body.appendChild(domView)
  })

  afterEach(() => {
    domView.parentNode.removeChild(domView)
  })

  it('creates new instance', async () => {
    const form = new FormView({ rootEl: 'theForm' })
    expect(form.el.id).to.eq("theForm")
    expect(form.el.name.value).to.be.empty
  })

  it('creates new instance with prop', async () => {
    const form = new FormView({ rootEl: 'theForm', prop1: 100, prop2: 'foo' })
    expect(form.el.id).to.eq("theForm");
    expect(form.el.name.value).to.be.empty
    expect(form.prop1).to.eq(100);
    expect(form.prop2).to.eq('foo');
  })

  it('creates new instance expanding data of prop', () => {
    const form = new FormView({
        rootEl: 'theForm',
        data: { name: 'Nancy', age: 25, gender: 'female', country: 'uk' },
        fields: ['name', 'age', 'gender', 'country']
      })

    expect(form.el.id).to.eq("theForm");

    expect(form.el.name.value).to.eq("Nancy");
    expect(form.el.age.value).to.eq("25");
    expect(form.el.gender.value).to.eq("female");
    expect(form.el.country.value).to.eq("uk");

    expect(form.getValueOf('age')).to.eq(25);
  })

  it('creates new instance with fields, data and load', () => {
    const form = new FormView({
        rootEl: 'theForm',
        prop1: 100,
        fields: 'name gender',
        data: {
          name: 'Micheal',
          age: 36,
          gender: 'male',
          country: 'america'
        }
      })

    expect(form.el.id).to.eq("theForm")
    expect(form.prop1).to.eq(100)

    expect(form.el.name.value).to.eq("Micheal")
    expect(form.el.age.value).to.eq("36");
    expect(form.el.gender.value).to.eq("male")
    expect(form.el.country.value).to.eq("america")
  })

  describe('extends FormView', () => {
    it('creates a subclass of FormView', async () => {
      const submitSpy = chai.spy();

      class SubFormView extends FormView {
        init() {
          this.fields = 'name age gender country';
        }

        handle(evts) {
          evts.submit = submitSpy;
          //evts.gender_change = genderChangeSpy;
        }
      }

      const form = new SubFormView({
                      rootEl: 'theForm',
                      data: {
                        name: 'Ken',
                        gender: 'male',
                        age: 16,
                        country: 'america'
                      }
                    })

      expect(form.el.id).to.eq("theForm")

      expect(form.el.name.value).to.eq("Ken")
      expect(form.el.age.value).to.eq("16")
      expect(form.el.gender.value).to.eq("male")
      expect(form.el.country.value).to.eq("america")

      const submitEvt = document.createEvent("HTMLEvents")
      submitEvt.initEvent('submit', true, true)
      form.el.dispatchEvent(submitEvt)

      const genderInputs = form.el.querySelectorAll('*[name="gender"]')
      genderInputs[1].checked = true
      await sleep(10)

      expect(submitSpy).to.have.been.called.with(form.el, submitEvt)
      const data = form.data
      expect(data).to.deep.eq({
        name: 'Ken',
        age: 16,
        gender: 'female',
        country: 'america',
        graduated: true
      })
    })
  })
})
