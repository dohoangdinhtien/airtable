const url_contact_form = endpointAir + `Form?api_key=${apiAirToken}&filterByFormula=active='1'&maxRecords=1`;
let url_customer = endpointAir + `Customer?api_key=${apiAirToken}`;

var renderForm = Vue.component('render-form', {
  props: ['form', 'models'],
  data: function () {
    return {
      initModels: {},
      formModels: {},
    }
  },
  watch: {
    // form: function (val) {
    //   console.log(val);
    // }
  },
  mounted: function () {
    const vm = this;
    this.$nextTick(function () {
      vm.initModels = _.cloneDeep(vm.models);
      vm.formModels = _.cloneDeep(vm.models);
      console.log(vm.$data);
    })
  },
  methods: {
    onSubmit: function (e) {
      let val = {
        "Name": this.formModels['form_name'],
        "Phone": this.formModels['form_phone'],
        "Address": this.formModels['form_address'],
        "City": this.formModels['form_city'],
        "District": this.formModels['form_district'],
        "Ward": this.formModels['form_ward'],
        "Package": this.formModels['form_packages'],
        "Note": this.formModels['form_note']
      }
      
      axios.post(url_customer, {
        fields: val,
        typecast: true
      }).then(function (res) {
        Swal.fire(
          'Đặt hàng thành công!',
          'Cám ơn bạn đã đặt hàng.',
          'success'
        );
      }).catch(function (error) {
        console.log(error);
        // alert(error.response.data.error.message);
      });
      
      this.formModels = _.cloneDeep(this.initModels);
      e.preventDefault();
    }
  },
  template: `
    <div class="box-render-form">
      <div class="box-render-form__empty" v-if="form == null">
        Loading
      </div>
      <div class="box-render-form__form-loaded" v-if="form != null">
        <div class="d-block w-100" v-if="form.informations != null">
          <template v-for="(info, name) in form.informations">
            <div class="d-flex flex-column p-2" v-if="name == 'address'">
              Địa chỉ: {{ info }}
            </div>
            <div class="d-flex flex-column p-2" v-if="name == 'hotline'">
              Hotline: {{ info }}
            </div>
            <div class="d-flex flex-column p-2" v-if="name == 'email'">
              Email: {{ info }}
            </div>
            <div class="d-flex flex-column p-2" v-if="name == 'facebook'">
              Facebook: {{ info }}
            </div>
          </template>
        </div>
        <form class="d-block w-100" v-if="form.elements != null" @submit="onSubmit">
          <div class="form-row">
            <template v-for="(el, name) in form.elements">
              <div class="form-group" :class="[el.class]" v-if="el.active == '1'">
                <label :for="name" v-if="el.label && el.label != 'null' && el.type != 'button'">{{ el.label }}</label>
                <template v-if="el.type == 'input'">
                  <input v-model="formModels[name]" type="input" class="form-control" :required="el.required" :name="name" :placeholder="el.placeholder">
                </template>
                <template v-if="el.type == 'tel'">
                  <input v-model="formModels[name]" type="tel" pattern="[0-9]{9,12}" class="form-control" :required="el.required" :name="name" :placeholder="el.placeholder">
                </template>
                <template v-if="el.type == 'textarea'">
                  <textarea v-model="formModels[name]" class="form-control" :name="name" :placeholder="el.placeholder" rows="3"></textarea>
                </template>
                <template v-if="el.type == 'radio'">
                  <div class="form-check" v-for="(option, index) in el.options">
                    <input v-model="formModels[name]" :checked="index == 0" class="form-check-input" type="radio" :name="name" :id="name + '_' + index" :value="option">
                    <label class="form-check-label" :for="name + '_' + index">
                      {{ option }}
                    </label>
                  </div>
                </template>
                <template v-if="el.type == 'button'">
                  <button type="submit" class="btn btn-primary">{{ el.label }}</button>
                </template>
              </div>
            </template>
          </div>
        </form>
      </div>
    </div>
  `
})

const app = new Vue({
  el: '#app',
  components: {
    'render-form': renderForm,
  },
  data: {
    form: null,
    models: {},
  }
})

axios.get(url_contact_form).then(function (res) {
  if (res && res.data.records && res.data.records.length > 0) {
    let data = res.data.records[0].fields;
    let form = {
      elements: {},
      informations: {}
    };

    _.forEach(data, function(value, key) {
      if (key.includes('form_')) {
        app.models[key] = null;
        const _data = value.split('\n');
        const _objAttr = {};
        _.forEach(_data, function(_value, _key) {
          const attr = _value.split(':');
          _objAttr[attr[0]] = attr[1] != undefined ? attr[1].trim() : null;
          if (attr[0] == 'width') {
            _objAttr['class'] = `col-md-${attr[1].trim()}`;
          }
          if (attr[0] == 'options') {
            const options = attr[1].split(',');
            _objAttr[attr[0]] = options;
          }
        })
        form['elements'][key] = _objAttr;
      } else {
        form['informations'][key] = value;
      }
    });
    form['elements'] = Object.fromEntries(
      Object.entries(form['elements']).sort( (a,b) => a[1].order - b[1].order )    
    )
    app.form = form;
  } else {
    alert ("Missing Contact Form Data");
  }
}).catch(function (error) {
  console.log(error);
});