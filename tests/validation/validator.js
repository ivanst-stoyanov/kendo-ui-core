(function() {

    var container,
        Validator = kendo.ui.Validator;

    function setup(element, options) {
        if (!element.parent().length) {
            element.appendTo(container);
        }
        return new Validator(element, $.extend({}, options));
    }

    module("kendo.ui.validation", {
        setup: function() {
            kendo.ns = "kendo-";

            QUnit.fixture.append(
                '<script id="template" type="text/x-kendo-template">' +
                '<span>template text</span>' +
                '</script>'
            );
            container = $("<div/>").appendTo("<form/>").appendTo(QUnit.fixture);
        },
        teardown: function() {
            kendo.destroy(QUnit.fixture);

            kendo.ns = "";
            kendo.ui.validator = { rules: {}, messages: {} };
            container.remove();
        }
    });

    test("validate returns false for empty input with attribute required", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate triggers validate event", 1,  function() {
        var input = $('<input type="text" required />'),
            validator = setup(input, {
                validate: function(e) {
                    ok(!e.valid);
                }
            });

        validator.validate();
    });

    test("validate returns true for non empty input with attribute required", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        input.val("someValue");

        ok(validator.validate());
    });

    test("validate returns true for non empty input with attribute required which is initially invalid", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        ok(!validator.validate());

        input.val("someValue");

        ok(validator.validate());
    });

    test("checkValidity returns true for non empty input with attribute required", function() {
        var input = $('<input type="text" required="required" />'),
            validator = setup(input);

        input.val("someValue");

        ok(validator._checkValidity(input));
    });

    test("validates multiple input elements if initialized with container", function() {
        container.append($('<input type="text" required="required" /><input type="text" required="required" />'));
        var validator = setup(container);
        ok(!validator.validate());
    });

    test("validate returns false if at least one element is invalid", function() {
        container.append($('<input type="text" required="required" value="1" /><input type="text" required="required" />'));
        var validator = setup(container);
        ok(!validator.validate());
    });

    test("validate returns true if every element is valid", function() {
        container.append($('<input type="text" required="required" value="1" /><input type="text" required="required" value="2" />'));
        var validator = setup(container);
        ok(validator.validate());
    });

    test("validate returns true if container does not contain input elements", function() {
        container.append($('<span />'));
        var validator = setup(container);
        ok(validator.validate());
    });

    test("validate returns false if checkbox marked as required is not checked", function() {
        container.append($('<input type="checkbox" required />'));
        var validator = setup(container);
        ok(!validator.validate());
    });

    test("validate returns true if checkbox marked as required is checked", function() {
        container.append($('<input type="checkbox" required checked="checked"/>'));
        var validator = setup(container);
        ok(validator.validate());
    });

    test("validate returns false if checkbox marked as required is not checked but have value set", function() {
        container.append($('<input type="checkbox" required value="foo"/>'));
        var validator = setup(container);
        ok(!validator.validate());
    });

    test("validate returns true if checkbox marked as required is checked and have value set", function() {
        container.append($('<input type="checkbox" required value="foo" checked="checked" />'));
        var validator = setup(container);
        ok(validator.validate());
    });

    test("validate returns false if multi select is marked as required and no value is selected", function() {
        container.append($('<select multiple required><option>foo</option></select>'));
        var validator = setup(container);
        ok(!validator.validate());
    });

    test("validate returns true if multi select is marked as required and value is selected", function() {
        container.append($('<select multiple required><option value="foo" selected="selected">foo</option></select>'));
        var validator = setup(container);
        ok(validator.validate());
    });

    test("validate returns false if select is marked as required and option with empty value is selected", function() {
        container.append($('<select required><option value="" selected="selected">foo</option></select>'));
        var validator = setup(container);
        ok(!validator.validate());
    });

    test("validate returns true container is empty", function() {
        container.empty();
        var validator = setup(container);
        ok(validator.validate());
    });

    test("errors returns empty array if validate is not executed", function() {
        var input = $('<input type="text" required  validationMessage="message" />'),
            validator = setup(input);

        equal(validator.errors().length, 0);
    });

    test("errors returns type specific message if attribute is set for single invalid element", function() {
        var input = $('<input type="text" required  data-kendo-required-msg="required message" validationMessage="message" />'),
            validator = setup(input);

        validator.validate();
        var messages = validator.errors();

        equal(messages.length, 1);
        equal(messages[0], "required message");
    });

    test("errors returns validationMessage attribute value for single invalid element", function() {
        var input = $('<input type="text" required  validationMessage="message" />'),
            validator = setup(input);

        validator.validate();
        var messages = validator.errors();

        equal(messages.length, 1);
        equal(messages[0], "message");
    });

    test("errors returns title if no validationMessage attribute for single invalid element", function() {
        var input = $('<input type="text" required  title="message" />'),
            validator = setup(input);

            validator.validate();
        var messages = validator.errors();
        equal(messages.length, 1);
        equal(messages[0], "message");
    });

    test("errors returns validationMessage if both validationMessage and title are set for single invalid element", function() {
        var input = $('<input type="text" required  title="message" validationMessage="validationMessage"/>'),
            validator = setup(input);

            validator.validate();
        var messages = validator.errors();
        equal(messages.length, 1);
        equal(messages[0], "validationMessage");
    });

    test("errors returns formatted with input name message if set for single invalid element", function() {
        var input = $('<input type="text" name="Foo" required validationMessage="{0} is invalid"/>'),
            validator = setup(input);

        validator.validate();

        var messages = validator.errors();
        equal(messages.length, 1);
        equal(messages[0], "Foo is invalid");
    });

    test("errors returns messages for every invalid element", function() {
        container.append($('<input name="input1" type="text" required="required" title="input1 message" /><input name="input2" type="text" required="required" title="input2 message"/>'));
        var validator = setup(container);

        validator.validate();

        var messages = validator.errors();
        equal(messages.length, 2);
        equal(messages[0], "input1 message");
        equal(messages[1], "input2 message");
    });

    test("errors is cleared if revalidated single input", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        validator.validate();
        input.val("someValue");
        validator.validate();

        var messages = validator.errors();
        equal(messages.length, 0);
    });

    test("errors are reset if element is valid multiple inputs", function() {
        container.append($('<input name="input1" type="text" required="required" title="input1 message" /><input name="input2" type="text" required="required" title="input2 message"/>'));
        var validator = setup(container);

        validator.validate();

        container.find(":input").first().val("someValue");

        validator.validate();

        var messages = validator.errors();
        equal(messages.length, 1);
        equal(messages[0], "input2 message");
    });

    test("existing error message element container is reused", function() {
        container.append($('<input type="text" name="foo" required validationMessage="invalid" /><span>some text</span><span class="k-invalid-msg" data-kendo-for="foo"/>')),
        validator = setup(container, { errorTemplate: "<span>${message}</span>" });
        validator.validate();

        var span = container.find("span");
        ok(!span.eq(0).hasClass("k-invalid-msg"));
        ok(span.eq(1).hasClass("k-invalid-msg"));
        ok(span.eq(1).text(), "invalid");
    });

    test("existing error message element in multiple containers is reused", function() {
        container.append($('<div></div><div><input type="text" name="foo" required validationMessage="invalid" /><span>some text</span><span class="k-invalid-msg" data-kendo-for="foo"/></div>')),
        validator = setup(container.find("div"), { errorTemplate: "<span>${message}</span>" });
        validator.validate();

        var span = container.find("span");
        ok(!span.eq(0).hasClass("k-invalid-msg"));
        ok(span.eq(1).hasClass("k-invalid-msg"));
        ok(span.eq(1).text(), "invalid");
    });

    test("existing error message element container is reused on multiple validate calls", function() {
        container.append($('<input type="text" name="foo" required validationMessage="invalid" /><span>some text</span><span class="k-invalid-msg" data-kendo-for="foo"/>')),
        validator = setup(container, { errorTemplate: "<span>${message}</span>" });
        validator.validate();
        validator.validate();

        equal(container.find("span.k-invalid-msg").length, 1);
    });

    test("error message as external template", function() {
        var input = $('<input type="text" required validationMessage="invalid" />'),
        validator = setup(input, { errorTemplate: $("#template").html() });
        validator.validate();

        equal(input.next("span").text(), "template text");
    });

    test("displayes message next to the validated element", function() {
        var input = $('<input type="text" required validationMessage="invalid" />'),
        validator = setup(input, { errorTemplate: "<span>${message}</span>" });
        validator.validate();

        equal(input.next("span").text(), "invalid");
    });

    test("hideMessages hides the validation message", function() {
        var input = $('<input type="text" required validationMessage="invalid" />'),
        validator = setup(input, { errorTemplate: "<span>${message}</span>" });

        validator.validate();
        validator.hideMessages();

        ok(!input.next("span").is(":visible"));
    });

    test("hideMessages hides the validation messages for the container", function() {
        container.append($('<input type="text" name="foo" required validationMessage="invalid" /><input type="text" name="bar" required validationMessage="invalid" />')),
        validator = setup(container, { errorTemplate: "<span>${message}</span>" });

        validator.validate();
        validator.hideMessages();

        equal(container.find("span.k-invalid-msg").length, 2);
        ok(!container.find("span.k-invalid-msg").is(":visible"));
    });

    test("multiple calls to validation does not render multiple messages", function() {
        var input = $('<input type="text" required validationMessage="invalid" />'),
        validator = setup(input, { errorTemplate: "<span>${message}</span>" });

        validator.validate();
        validator.validate();
        validator.validate();

        equal(input.parent().find("span.k-invalid-msg").length, 1);
    });

    test("does not displayes message if element is valid", function() {
        var input = $('<input type="text" required validationMessage="invalid" value="1" />'),
        validator = setup(input);
        validator.validate();

        ok(!input.next("span").length);
    });

    test("message element is hidden if element change its state from invalid to valid", function() {
        var input = $('<input type="text" required validationMessage="invalid" />'),
            validator = setup(input);

        validator.validate();

        input.val("someValue");

        validator.validate();

        ok(!input.next("span:visible").length);
    });

    test("message element is hidden if input with $ in the name change its state from invalid to valid ", function() {
        var input = $('<input name="foo$bar" type="text" required validationMessage="invalid" />');
        container.append(input);
        var validator = setup(container);

        validator.validate();

        input.val("someValue");

        validator.validate();

        ok(!input.next("span:visible").length);
    });

    test("message element is hidden if input with special charecters in the name change its state from invalid to valid ", function() {
        var input = $('<input name="!#$%&()*+,./:;<=>?@[]^`" type="text" required validationMessage="invalid" />');
        container.append(input);
        var validator = setup(container);

        validator.validate();

        input.val("someValue");

        validator.validate();

        ok(!input.next("span:visible").length);
    });

    test("external message element is shown when validating input with specail charecters", function() {
        var input = $('<input name="f.b" type="text" required validationMessage="invalid" /><input name="f.b.c" type="hidden" /><span class="k-invalid-msg" data-kendo-for="f.b" id="foo"></span>');
        container.append(input);
        var validator = setup(container);

        validator.validate();

        equal(container.children("span").length, 1);
    });

    test("individualErrors template overrides the default template", function() {
        var input = $('<input type="text" required validationMessage="invalid"/>'),
        validator = setup(input, {
            errorTemplate: "<div>${message}</div>"
        });
        validator.validate();
        equal(input.next("div").text(), "invalid");
    });

    test("validate returns true if input with type=text value does not match min attribute", function() {
        var input = $('<input type="text" value="1" min="10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text and data-kendo-type=number value does not match min attribute", function() {
        var input = $('<input type="text" value="1" min="10" data-kendo-type="number" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns false if input with type=number value does not match min attribute", function() {
        var input = $('<input type="number" value="1" min="10" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns false if input with type=number value does not match min attribute decimal", function() {
        var input = $('<input type="number" value="10" min="10.10" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=number value does match min attribute decimal", function() {
        var input = $('<input type="number" value="10.10" min="10.10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=number value does match min attribute", function() {
        var input = $('<input type="number" value="11" min="10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=text and data-kendo-type=number value does match min attribute", function() {
        var input = $('<input type="text" value="11" min="10" data-kendo-type="number" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=number value does have same value as min attribute", function() {
        var input = $('<input type="number" value="10" min="10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with data-type=number value is bigger than the min attribute when a culture with comma for the decimal separator is used", function() {
        var input = $('<input ' + kendo.attr("type") + '="number" value="10,6" min="10.5" />'),
            validator = setup(input),
            culture = kendo.culture(),
            defaultDecimalSeparator = culture.numberFormat["."],
            defaultGroupSeparator = culture.numberFormat[","];

        culture.numberFormat["."] = ",";
        culture.numberFormat[","] = ".";

        ok(validator.validate());

        culture.numberFormat["."] = defaultDecimalSeparator;
        culture.numberFormat[","] = defaultGroupSeparator;
    });

    test("validate returns false if input with data-type=number value is smaller than the min attribute when a culture with comma for the decimal separator is used", function() {
        var input = $('<input ' + kendo.attr("type") + '="number" value="10,4" min="10.5" />'),
            validator = setup(input),
            culture = kendo.culture(),
            defaultDecimalSeparator = culture.numberFormat["."],
            defaultGroupSeparator = culture.numberFormat[","];

        culture.numberFormat["."] = ",";
        culture.numberFormat[","] = ".";

        ok(!validator.validate());

        culture.numberFormat["."] = defaultDecimalSeparator;
        culture.numberFormat[","] = defaultGroupSeparator;
    });

    test("validate returns true if input with type=number value does have same value as max attribute", function() {
        var input = $('<input type="number" value="10" max="10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text and data-kendo-type=number value does not match max attribute", function() {
        var input = $('<input type="text" value="11" max="10" data-kendo-type="number" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=text and data-kendo-type=number value match max attribute decimal value", function() {
        var input = $('<input type="text" value="10.10" max="10.20" data-kendo-type="number" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text and data-kendo-type=number value does not match max attribute decimal value", function() {
        var input = $('<input type="text" value="10.20" max="10" data-kendo-type="number" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with data-type=number value is smaller than the max attribute when a culture with comma for the decimal separator is used", function() {
        var input = $('<input ' + kendo.attr("type") + '="number" value="10,4" max="10.5" />'),
            validator = setup(input),
            culture = kendo.culture(),
            defaultDecimalSeparator = culture.numberFormat["."],
            defaultGroupSeparator = culture.numberFormat[","];

        culture.numberFormat["."] = ",";
        culture.numberFormat[","] = ".";

        ok(validator.validate());

        culture.numberFormat["."] = defaultDecimalSeparator;
        culture.numberFormat[","] = defaultGroupSeparator;
    });

    test("validate returns false if input with data-type=number value is bigger than the max attribute when a culture with comma for the decimal separator is used", function() {
        var input = $('<input ' + kendo.attr("type") + '="number" value="10,6" max="10.5" />'),
            validator = setup(input),
            culture = kendo.culture(),
            defaultDecimalSeparator = culture.numberFormat["."],
            defaultGroupSeparator = culture.numberFormat[","];

        culture.numberFormat["."] = ",";
        culture.numberFormat[","] = ".";

        ok(!validator.validate());

        culture.numberFormat["."] = defaultDecimalSeparator;
        culture.numberFormat[","] = defaultGroupSeparator;
    });

    test("validate returns false if input with type=number value does not match max attribute", function() {
        var input = $('<input type="number" value="11" max="10" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=text value does not match max attribute", function() {
        var input = $('<input type="text" value="11" max="10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=number value does match max attribute", function() {
        var input = $('<input type="number" value="9" max="10" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=text and data-kendo-type=number value does match step attribute and have min set with three decimal places step", function() {
        var input = $('<input type="text" value="3.5" step="0.001" data-kendo-type="number" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=text and data-kendo-type=number value does match step attribute and have min set with two decimal places step", function() {
        var input = $('<input type="text" value="3.5" step="0.01" data-kendo-type="number" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns true if input with type=text and data-kendo-type=number value does match step attribute and have min set with decimal step", function() {
        var input = $('<input type="text" value="18.1" step="0.1" min="5" data-kendo-type="number" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text and data-kendo-type=number value does not match step attribute and have min set", function() {
        var input = $('<input type="text" value="6" max="10" step="3" min="5" data-kendo-type="number" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns false if input with type=number value does not match step attribute and have min set", function() {
        var input = $('<input type="number" value="6" max="10" step="3" min="5" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=number value does match step attribute and have both max and min set", function() {
        var input = $('<input type="number" value="8" max="10" step="3" min="5" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate min defaults to 0 if not set and step is set - invalid value", function() {
        var input = $('<input type="number" value="8" step="3" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate min defaults to 0 if not set and step is set - valid value", function() {
        var input = $('<input type="number" value="8" step="4" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text value does not match pattern attribute", function() {
        var input = $('<input type="text" value="aaa" pattern="\\d"/>'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=text value does match pattern attribute", function() {
        var input = $('<input type="text" value="6" pattern="\\d"/>'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text and data-kendo-type=email value is not valid email", function() {
        var input = $('<input type="text" value="aaaaa" data-kendo-type="email" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns false if input with type=email value is not valid email", function() {
        var input = $('<input type="email" value="aaaaa" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=email value is valid email", function() {
        var input = $('<input type="email" value="test@test.com" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=email value does not match the pattern", function() {
        var input = $('<input type="email" value="test@test.com" pattern="6test?@\\w+\\.\\w+" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns false if input with type=email value does not match the pattern", function() {
        var input = $('<input type="email" value="6test@test.com" pattern="6test?@\\w+\\.\\w+" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=text and data-kendo-type=url value does not match", function() {
        var input = $('<input type="text" value="test" data-kendo-type="url" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns false if input with type=url value does not match", function() {
        var input = $('<input type="url" value="test" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=url value match", function() {
        var input = $('<input type="url" value="http://www.test.test" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=url value does not match the pattern", function() {
        var input = $('<input type="url" value="http://test.test" pattern="https?://www.+" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=url value does match the pattern", function() {
        var input = $('<input type="url" value="http://www.test.test" pattern="https?://www.+" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=tel value does not match the pattern", function() {
        var input = $('<input type="tel" value="test" pattern="\\d+" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=tel value does match the pattern", function() {
        var input = $('<input type="tel" value="666" pattern="\\d+" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=password value does not match the pattern", function() {
        var input = $('<input type="password" value="aaa" pattern="\\d+" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=password value does match the pattern", function() {
        var input = $('<input type="password" value="666" pattern="\\d+" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate returns false if input with type=search value does not match the pattern", function() {
        var input = $('<input type="search" value="test" pattern="\\d+" />'),
            validator = setup(input);

        ok(!validator.validate());
    });

    test("validate returns true if input with type=search value does match the pattern", function() {
        var input = $('<input type="search" value="666" pattern="\\d+" />'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate class is added to the invalid inputs", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        validator.validate();

        ok(input.hasClass("k-invalid"));
    });

    test("aria-invalid is added to the invalid input", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        validator.validate();

        ok(input.filter("[aria-invalid]").length);
    });

    test("aria-alert is added to the invalid input message", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        validator.validate();

        ok(input.next().filter("[role=alert]").length);
    });

    test("aria-invalid is remove after input become valid", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        validator.validate();
        input.val("foo");
        validator.validate();

        ok(!input.filter("[aria-invalid]").length);
    });

    test("validate class is not added to the valid inputs", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        input.val(1);

        validator.validate();

        ok(!input.hasClass("k-invalid"));
    });

    test("validate class is remove to if invalid inputs pass validation", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        validator.validate();

        input.val(1);

        validator.validate();

        ok(!input.hasClass("k-invalid"));
    });

    test("checkbox field is revalidated on click", function() {
        var input = $('<input type="checkbox" required />'),
            validator = setup(input);

        input.trigger("click");
        input.trigger("click");

        ok(input.hasClass("k-invalid"));
    });

    test("checkbox field is revalidated on click when validation is attached to the container", function() {
        var container = $('<div><input type="checkbox" required /></div>'),
            validator = setup(container),
            input = container.find("input");

        input.trigger("click");
        input.trigger("click");

        ok(input.hasClass("k-invalid"));
    });

    test("input fields are not revalidated on click", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        input.trigger("click");
        ok(!input.hasClass("k-invalid"));
    });


    test("field is revalidated on blur", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        input.trigger("blur");
        ok(input.hasClass("k-invalid"));
    });

    test("field is not revalidated on blur validateonblur is false", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input, { validateOnBlur: false });

        input.trigger("blur");

        ok(!input.hasClass("k-invalid"));
    });

    test("multiple errors are not added when invalid input is blured several times", function() {
        var input = $('<input type="text" required />'),
            validator = setup(input);

        input.trigger("blur");
        input.trigger("blur");
        equal(validator.errors().length, 1);
    });

    test("field is revalidated on blur with container", function() {
        container.append($('<input type="text" required="required" title="input1 message" /><input type="text" required="required" title="input2 message"/>'));
        var validator = setup(container);

        container.find(":input").trigger("blur");
        ok(container.find(":input").eq(0).hasClass("k-invalid"));
        ok(container.find(":input").eq(1).hasClass("k-invalid"));
    });

    test("message for required is applied", function() {
        var input = $('<input type="text" required />'),
        validator = setup(input, { messages: { required: "Field is required" } });

        validator.validate();

        equal(validator.errors()[0], "Field is required");
    });

    test("message for min is applied with min attribute value", function() {
        var input = $('<input name="Foo" type="number" min="2" value="1" />'),
        validator = setup(input);

        validator.validate();

        equal(validator.errors()[0], "Foo should be greater than or equal to 2");
    });

    test("message for max is applied with max attribute value", function() {
        var input = $('<input name="Foo" type="number" max="2" value="10" />'),
        validator = setup(input);

        validator.validate();

        equal(validator.errors()[0], "Foo should be smaller than or equal to 2");
    });

    test("message as function", function() {
        var input = $('<input type="text" required />'),
            element,
            validator = setup(input, { messages: {
                    required: function() {
                        element = arguments[0];
                        return "Field is required";
                    }
            }});

        validator.validate();

        equal(validator.errors()[0], "Field is required");
        ok(element);
    });

    test("custom validation rule is executed", function() {
        var input = $('<input name="Field" type="text" />'),
            element,
            validator = setup(input, {
                rules: {
                    custom: function() {
                        element = arguments[0];
                        return false
                    }
                },
                messages: { custom: "Custom message" }
            });

        ok(!validator.validate());
        equal(element[0], input[0]);
        equal(validator.errors()[0], "Custom message");
    });

    test("form submit is preveneted if container is form element and validation fails", function() {
        container.append($('<form><input type="text" required="required" title="input1 message" /></form>'));
        var validator = setup(container.find("form")),
            called = false;

        container.find("form").bind("submit", function(e) {
            called = true;
            e.preventDefault();
        }).trigger("submit");

        ok(!called);
    });

    test("form is submited if container is form element and validation pass", function() {
        container.append($('<form><input type="text" required="required" title="input1 message" value="1" /></form>'));
        var validator = setup(container.find("form")),
            called = false;

        container.find("form").bind("submit", function(e) {
            called = true;
            e.preventDefault();
        }).trigger("submit");

        ok(called);
    });

    test("novalidate is added to the form if container is a form element", function() {
        container.append($('<form><input type="text" required="required" title="input1 message" /></form>'));
        var form = container.find("form"),
            validator = setup(form);

        ok(form.attr("novalidate"), "novalidate");
    });

    test("validate skips button elements", function() {
        container.append("<button type=button /><input type=submit /><input type=submit />");
        var calledCount = 0,
            validator = setup(container, {
                rules: {
                    custom: function() {
                        calledCount++;
                        return true;
                    }
                }
            });

        validator.validate();
        equal(calledCount, 0);
    });

    test("validate skips input[type=submit] elements", function() {
        container.append("<input type=submit />");
        var calledCount = 0,
            validator = setup(container, {
                rules: {
                    custom: function() {
                        calledCount++;
                        return true;
                    }
                }
            });

        validator.validate();
        equal(calledCount, 0);
    });

    test("validate skips input[type=button] elements", function() {
        container.append("<input type=button />");
        var calledCount = 0,
            validator = setup(container, {
                rules: {
                    custom: function() {
                        calledCount++;
                        return true;
                    }
                }
            });

        validator.validate();
        equal(calledCount, 0);
    });

    test("validate skips input[type=reset] elements", function() {
        container.append("<input type=reset />");
        var calledCount = 0,
            validator = setup(container, {
                rules: {
                    custom: function() {
                        calledCount++;
                        return true;
                    }
                }
            });

        validator.validate();
        equal(calledCount, 0);
    });

    test("validate skips disabled inputs elements", function() {
        container.append('<input type="text" disabled="disabled" />');
        var calledCount = 0,
            validator = setup(container, {
                rules: {
                    custom: function() {
                        calledCount++;
                        return true;
                    }
                }
            });

        validator.validate();
        equal(calledCount, 0);
    });

    test("validate skips readonly inputs elements", function() {
        container.append('<input type="text" readonly="readonly" />');
        var calledCount = 0,
            validator = setup(container, {
                rules: {
                    custom: function() {
                        calledCount++;
                        return true;
                    }
                }
            });

        validator.validate();
        equal(calledCount, 0);
    });


/* //Chrome type=date does not return value if it is not valid date
    test("validate returns false if input type=date value is not valid date", function() {
        var input = $('<input type="date" value="foo"/>'),
            validator = setup(input);

        ok(!validator.validate())
    });

    test("validate returns true if input type=date value is valid date", function() {
        var input = $('<input type="date" value="1/1/2001"/>'),
            validator = setup(input);

        ok(validator.validate());
    });
*/
    test("validate returns false if input type=text and data-kendo-type=date value is not valid date", function() {
        var input = $('<input type="text" data-kendo-type="date" value="foo"/>'),
            validator = setup(input);

        ok(!validator.validate())
    });

    test("validate returns true if input type=text and data-kendo-type=date value is valid date", function() {
        var input = $('<input type="text" data-kendo-type="date" value="1/1/2001"/>'),
            validator = setup(input);

        ok(validator.validate());
    });

    test("validate input elements with array index names on multiple validation calls", 1, function() {
        container.append("<input type='text' name='test[]' />");
        var called = false,
            validator = setup(container, { rules: { custom: function(input) { called = true } } });

        validator.validate();
        validator.validate();
        ok(called);
    });

    test("register external rules", 1, function() {
        kendo.ui.validator.rules = { foo: function() { ok(true); } };

        container.append("<input type='text' name='test[]' />");

        var validator = setup(container, {});
        validator.validate();
    });

    test("external overrides default rules", 1, function() {
        kendo.ui.validator.rules = { required: function() { ok(true); } };

        container.append("<input type='text' name='test[]' />");

        var validator = setup(container);

        validator.validate();
    });

    test("custom rules overrides external rules", 1, function() {
        kendo.ui.validator.rules = { foo: function() { ok(false); } };

        container.append("<input type='text' name='test[]' />");

        var validator = setup(container, { rules: { foo: function() { ok(true) } } });
        validator.validate();
    });

    test("register external messages", 1, function() {
        kendo.ui.validator.rules = { foo: function() { return false; } };
        kendo.ui.validator.messages = { foo: function() { ok(true) } };

        container.append("<input type='text' name='test[]' />");

        var validator = setup(container, {});
        validator.validate();
    });

    test("external overrides default messages", 1, function() {
        kendo.ui.validator.rules = { required: function() { return false; } };
        kendo.ui.validator.messages = { required: function() { ok(true) } };

        container.append("<input type='text' name='test[]' />");

        var validator = setup(container);

        validator.validate();
    });

    test("custom overrides external messages", 1, function() {
        kendo.ui.validator.rules = { foo: function() { return false; } };
        kendo.ui.validator.messages = { foo: function() { ok(false) } };

        container.append("<input type='text' name='test[]' />");

        var validator = setup(container, { messages: { foo: function() { ok(true) } } });
        validator.validate();
    });

    test("locate custom message locator", 2, function() {
        kendo.ui.validator.messageLocators = {
            mylocator: {
                locate: function(element, fieldName) {
                    equal(element[0], container[0]);
                    equal(fieldName, "test");
                }
            }
        };

        container.append("<input type='text' name='test' />");

        var validator = setup(container);
        validator.validate();
    });

    test("decorate custom message locator", 2, function() {
        kendo.ui.validator.messageLocators = {
            mylocator: {
                locate: function(element, fieldName) {
                    return $();
                },
                decorate: function(message, fieldName) {
                    ok(message.length);
                    equal(fieldName, "test");
                }
            }
        };

        container.append("<input type='text' name='test' />");

        var validator = setup(container, { rules: { foo: function() { return false } } });
        validator.validate();
    });

    test("rules resolver is called", 1, function() {
        kendo.ui.validator.ruleResolvers = {
            foo: {
                resolve: function(element) {
                   deepEqual(element[0], container[0]);
                }
            }
        }
        container.append("<input type='text' name='test' />");

        var validator = setup(container);
    });

    test("resolves empty rules", 1, function() {
        kendo.ui.validator.ruleResolvers = {
            foo: {
                resolve: function(element) {
                    ok(true);
                    return;
                }
            }
        }
        container.append("<input type='text' name='test' />");

        var validator = setup(container);
    });

    test("resolved rules and messages are added to the validator", 2, function() {
        kendo.ui.validator.ruleResolvers = {
            foo: {
                resolve: function(element) {
                    return { rules: { foo: function() {} }, messages: { foo: "foo" } };
                }
            }
        }
        container.append("<input type='text' name='test' />");

        var validator = setup(container);
        ok("foo" in validator.options.rules);
        ok("foo" in validator.options.messages);
    });

    test("all rules resolver are called", 2, function() {
        kendo.ui.validator.ruleResolvers = {
            foo: {
                resolve: function(element) {
                   deepEqual(element[0], container[0]);
                }
            },
            bar: {
                resolve: function(element) {
                   deepEqual(element[0], container[0]);
                }
            }
        }
        container.append("<input type='text' name='test' />");

        var validator = setup(container);
    });

    test("resolved rules from multiple resolvers are merged", 2, function() {
        kendo.ui.validator.ruleResolvers = {
            foo: {
                resolve: function(element) {
                    return { rules: { foo: $.noop }};
                }
            },
            bar: {
                resolve: function(element) {
                    return { rules: { bar: $.noop }};
                }
            }
        }
        container.append("<input type='text' name='test' />");

        var validator = setup(container);

        ok("foo" in validator.options.rules);
        ok("bar" in validator.options.rules);
    });

    test("validating a container which contains svg", function() {
        container.append($('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="120" height="120" viewBox="0 0 236 120"></svg><input type="text" required="required" />'));
        var validator = setup(container);
        ok(!validator.validate());
    });

})();
