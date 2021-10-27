import {TemplateText} from '../src/template-text';

test('Template Text Init', () => {
	const text = new TemplateText();

	expect(text).toEqual(new TemplateText());
});

test('Template Text - Setting Values', () => {
	const text = new TemplateText();

	text.text = 'foo';
	text.language = 'en';
	text.format = 'bar';

	expect(text.text).toEqual('foo');
	expect(text.language).toEqual('en');
	expect(text.format).toEqual('bar');
});

test('Template Text - Setting Values on Constructor', () => {
	const text = new TemplateText('foo', 'bar', 'en');

	expect(text.text).toEqual('foo');
	expect(text.format).toEqual('bar');
	expect(text.language).toEqual('en');
});

test('Template Text - Setting Values on Constructor', () => {
	const text = new TemplateText(undefined, 'bar', 'en');

	expect(text.text).toEqual('');
	expect(text.format).toEqual('bar');
	expect(text.language).toEqual('en');
});

test('Template Text - Constructor - ', () => {
	const text = new TemplateText(undefined, undefined, 'en');

	expect(text.text).toEqual('');
	expect(text.format).toEqual('');
	expect(text.language).toEqual('en');
});

test('Template Text - Setting Values on Constructor', () => {
	const text = new TemplateText(undefined, undefined, undefined);

	expect(text.text).toEqual('');
	expect(text.format).toEqual('');
	expect(text.language).toEqual('');
});
