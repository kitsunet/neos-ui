import React from 'react';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import Immutable from 'immutable';

import SelectBoxEditor from './index.js';
import {WrapWithMockGlobalRegistry, MockDataSourceDataLoader} from '../../_lib/testUtils';

Enzyme.configure({adapter: new Adapter()});

const optionValues = {
    foo: {
        label: 'fooLabel'
    },
    bar: {
        label: 'barLabel'
    }
};
const dropdownElementLabels = (component, count = 0) => {
    const countArray = Array.from(Array(count).keys());
    return countArray.map(index => {
        return component.find('SelectBox').find('ShallowDropDownContents').children().childAt(index).text();
    });
};

const dropdownHeader = component =>
    component.find('SelectBox').find('ShallowDropDownHeader');

const multiselectLabels = component =>
    component.find('ul').first().children().map(node => node.text());

const commit = () => {};

test(`SelectBox > single, no dataSource, no preselected value`, () => {
    const expectedDropdownElementLabels = ['fooLabel', 'barLabel'];
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <SelectBoxEditor commit={commit} options={{values: optionValues}}/>
        </WrapWithMockGlobalRegistry>
    );

    expect(dropdownHeader(component).text()).toBe('');
    expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
});

test(`SelectBox > single, no dataSource, preselected value`, () => {
    const expectedDropdownElementLabels = ['fooLabel', 'barLabel'];
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <SelectBoxEditor commit={commit} options={{values: optionValues}} value="bar"/>
        </WrapWithMockGlobalRegistry>
    );

    expect(dropdownHeader(component).text()).toBe('barLabel');
    expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
});

test(`SelectBox > multi, no dataSource, no preselected value`, () => {
    const expectedDropdownElementLabels = ['fooLabel', 'barLabel'];
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <SelectBoxEditor commit={commit} options={{values: optionValues, multiple: true}}/>
        </WrapWithMockGlobalRegistry>
    );

    expect(multiselectLabels(component)).toEqual([]);
    expect(dropdownHeader(component).text()).toBe('');
    expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
});

test(`SelectBox > multi, no dataSource, preselected value`, () => {
    const expectedDropdownElementLabels = ['barLabel'];
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <SelectBoxEditor commit={commit} options={{values: optionValues, multiple: true}} value={['foo']}/>
        </WrapWithMockGlobalRegistry>
    );

    expect(multiselectLabels(component)).toEqual(['fooLabel']);
    expect(dropdownHeader(component).text()).toBe('');
    // already selected values should not be in the list to choose anymore
    expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
});

/**
 * DATA SOURCES
 */
const store = createStore(state => state, Immutable.fromJS({
    cr: {
        nodes: {
            focused: {
                contextPath: '/my/focused-context-path'
            }
        }
    }
}));

test(`SelectBox > single, dataSource, no preselected value`, () => {
    MockDataSourceDataLoader.reset();
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <Provider store={store}>
                <SelectBoxEditor commit={commit} options={{dataSourceIdentifier: 'ds1'}}/>
            </Provider>
        </WrapWithMockGlobalRegistry>
    );

    expect(dropdownHeader(component).text()).toBe('[Loading]');
    expect(dropdownElementLabels(component)).toEqual([]);

    return MockDataSourceDataLoader.resolveCurrentPromise(optionValues).then(() => {
        const expectedDropdownElementLabels = ['fooLabel', 'barLabel'];
        component.update();
        expect(dropdownHeader(component).text()).toBe('');
        expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
    });
});

test(`SelectBox > single, dataSource, preselected value`, () => {
    MockDataSourceDataLoader.reset();
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <Provider store={store}>
                <SelectBoxEditor commit={commit} options={{dataSourceIdentifier: 'ds1'}} value="bar"/>
            </Provider>
        </WrapWithMockGlobalRegistry>
    );

    expect(dropdownHeader(component).text()).toBe('[Loading]');
    expect(dropdownElementLabels(component)).toEqual([]);

    return MockDataSourceDataLoader.resolveCurrentPromise(optionValues).then(() => {
        const expectedDropdownElementLabels = ['fooLabel', 'barLabel'];
        component.update();
        expect(dropdownHeader(component).text()).toBe('barLabel');
        expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
    });
});

test(`SelectBox > multi, dataSource, no preselected value`, () => {
    MockDataSourceDataLoader.reset();
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <Provider store={store}>
                <SelectBoxEditor commit={commit} options={{dataSourceIdentifier: 'ds1', multiple: true}}/>
            </Provider>
        </WrapWithMockGlobalRegistry>
    );

    expect(multiselectLabels(component)).toEqual([]);
    expect(dropdownHeader(component).text()).toBe('[Loading]');
    expect(dropdownElementLabels(component)).toEqual([]);

    return MockDataSourceDataLoader.resolveCurrentPromise(optionValues).then(() => {
        const expectedDropdownElementLabels = ['fooLabel', 'barLabel'];
        component.update();
        expect(multiselectLabels(component)).toEqual([]);
        expect(dropdownHeader(component).text()).toBe('');
        expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
    });
});

test(`SelectBox > multi, dataSource, preselected value`, () => {
    MockDataSourceDataLoader.reset();
    const component = mount(
        <WrapWithMockGlobalRegistry>
            <Provider store={store}>
                <SelectBoxEditor commit={commit} options={{dataSourceIdentifier: 'ds1', multiple: true}} value={['foo']}/>
            </Provider>
        </WrapWithMockGlobalRegistry>
    );

    expect(multiselectLabels(component)).toEqual(['[Loading foo]']);
    expect(dropdownHeader(component).text()).toBe('[Loading]');
    expect(dropdownElementLabels(component)).toEqual([]);

    return MockDataSourceDataLoader.resolveCurrentPromise(optionValues).then(() => {
        const expectedDropdownElementLabels = ['barLabel'];
        component.update();
        expect(multiselectLabels(component)).toEqual(['fooLabel']);
        expect(dropdownHeader(component).text()).toBe('');
        // already selected values should not be in the list to choose anymore
        expect(dropdownElementLabels(component, expectedDropdownElementLabels.length)).toEqual(expectedDropdownElementLabels);
    });
});
