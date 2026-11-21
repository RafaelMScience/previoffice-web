import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateVirtualSlice } from './use-virtual-list.ts';

describe('Item 23: Virtualização de Listas Longas (DOM Footprint & Scrolling)', () => {
  it('renders only visible window + overscan buffer for 1000 items', () => {
    // 1000 items, 50px each, container 500px, scrolled to 1000px
    const slice = calculateVirtualSlice(1000, 500, 1000, 50, 4);

    // rawStart = 1000 / 50 = 20
    // startIndex = max(0, 20 - 4) = 16
    assert.equal(slice.startIndex, 16);

    // visibleSlots = 500 / 50 = 10
    // rawEnd = 20 + 10 + 4 = 34
    assert.equal(slice.endIndex, 34);

    // Rendered items should be 34 - 16 = 18 items (instead of 1000!)
    assert.equal(slice.visibleCount, 18);

    // Spacer padding
    assert.equal(slice.topPadding, 16 * 50); // 800px
    assert.equal(slice.bottomPadding, (1000 - 34) * 50); // 48300px
  });

  it('handles empty list gracefully without negative paddings', () => {
    const slice = calculateVirtualSlice(0, 500, 0, 50);
    assert.equal(slice.startIndex, 0);
    assert.equal(slice.endIndex, 0);
    assert.equal(slice.visibleCount, 0);
    assert.equal(slice.topPadding, 0);
    assert.equal(slice.bottomPadding, 0);
  });

  it('keeps total DOM count constant regardless of list size (100 vs 10,000)', () => {
    const sliceSmall = calculateVirtualSlice(0, 600, 100, 60, 5);
    const sliceHuge = calculateVirtualSlice(0, 600, 10000, 60, 5);

    // Both should render only the viewport capacity + overscan (15 items)
    assert.equal(sliceSmall.visibleCount, 15);
    assert.equal(sliceHuge.visibleCount, 15);
  });
});
