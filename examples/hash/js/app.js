import { App, List, View, FormView, Page, ListView } from '../lib/flatout.js';

var groups = new List([
    {
      id: 'group1',
      name: 'Group 1'
    },
    {
      id: 'group2',
      name: 'Group 2'
    }
  ]);


class Index extends View {
  constructor() {
    super(document.body, { container: 'contentBox' })
  }

  title(pageTitle) {
    if (pageTitle) {
      return `${pageTitle} | TestApp Hash`
    } else {
      return 'TestApp Hash'
    }    
  }
}

class HomePage extends Page {
  html() {
    return `\
    <div>
      <a href="#!/groups">Group List</a>
    </div>`
  }
}

class GroupItemView extends View {
  html(data) {
    return `\
    <li>
      <a href="#!/groups/${data.id}">${data.name}</a>
      <button data-id="cButton">C Button</button>
    </li>`
  }

  handle(evts) {
    evts.cButton_click = (sender, e) => {
      console.log(e);
    }
  }
}

class GroupListPage extends Page {
  title() { return 'Groups' }

  html(data) {
    return `\
    <section>
     <h1>Group List</h1>
     <ul data-id="groupList"></ul>
     <div>
      <button data-id="moreButton">More</button>
     </div>
    </section>`
  }

  load(views) {
    views.groupList = new ListView(GroupItemView, { data: groups });
  }

  handle(evts) {
    evts.moreButton_click = () => {
      this.loadMore();
    }
  }

  loadMore() {
    var nextId = groups.length + 1;
    groups.add({
      id: `group${nextId}`,
      name: `Group${nextId}`
    }, 0);
  }
}

class GroupDetailPage extends Page {
  title() {
    return 'GroupDetail'
  }

  init() {
    return groups.find('id', this.context.groupId) || {};
  }

  html(data) {
    return `\
    <div>
     <nav>
      <a href="#!/groups">Group list</a>
     </nav>
     <h1>${data.name}</h1>
     <p>This is a list.</p>
    </div>`
  }
}

class Form extends Page {
  title() { return `Form Example` }

  html() {
    return `\
    <div data-id="formPage">
      <form data-id="userForm">
        <p>
          <label for="name">Name</label>
          <input type="text" name="name">
        </p>
        <p>
          <label for="age">Age</label>
          <input type="text" name="age">
        </p>
        <p>
          <label>Gender</label>
          <input type="radio" name="gender" value="male">Male
          <input type="radio" name="gender" value="female">Female
        </p>
        <p>
          <label>Country</label>
          <select name="country">
            <option value="japan">Japan</option>
            <option value="america">USA</option>
            <option value="uk">United Kingdom</option>
          </select>
        </p>
        <p>
          <button type="submit">Send</button>
        </p>
      </form>
    </div>`
  }

  load(views) {
    class SubForm extends FormView {
      handle(evts) {
        evts.submit = (sender, e) => {
          alert('test');
        }
      }
    }

    views.form = new SubForm('#userForm', {
        data: {
          name: 'Ken',
          gender: 'male',
          age: 16,
          country: 'america'
        }
      });
  }
}

App.activate(Index, {
  index: HomePage,
  groups: {
    index: GroupListPage,
    ':groupId': {
      index: GroupDetailPage
    }
  },
  form: {
    view: Form
  }
}, { mode: 'HASH' });
