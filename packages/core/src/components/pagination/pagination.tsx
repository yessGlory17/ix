/*
 * SPDX-FileCopyrightText: 2022 Siemens AG
 *
 * SPDX-License-Identifier: MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
} from '@stencil/core';

/**
 * @since 1.5.0
 */
@Component({
  tag: 'ix-pagination',
  styleUrl: 'pagination.scss',
  scoped: true,
})
export class Pagination {
  private readonly maxCountPages = 7;

  @Element() hostElement!: HTMLIxPaginationElement;

  /**
   * Advanced mode
   */
  @Prop() advanced: boolean;

  /**
   * Number of items shown at once.
   * Can only be changed in advaced mode.
   */
  @Prop() itemCount = 15;

  /**
   * Show item count in advanced mode
   */
  @Prop() showItemCount = true;

  /**
   * Total number of pages
   */
  @Prop() count: number;

  /**
   * Zero based index of currently selected page
   */
  @Prop({ mutable: true }) selectedPage = 0;

  /**
   * i18n
   */
  @Prop() i18nPage = 'Page';

  /**
   * i18n
   */
  @Prop() i18nOf = 'of';

  /**
  /**
   * i18n
   */
  @Prop() i18nItems = 'Items';

  /**
   * Page selection event
   */
  @Event() pageSelected: EventEmitter<number>;

  /**
   * Item count change event
   */
  @Event() itemCountChanged: EventEmitter<number>;

  get pageInput() {
    return this.hostElement.querySelector(
      '.advanced-pagination input.form-control'
    );
  }

  private selectPage(index: number) {
    if (index < 0) {
      this.selectedPage = 0;
    } else if (index > this.count - 1) {
      this.selectedPage = this.count - 1;
    } else {
      this.selectedPage = index;
    }

    this.pageSelected.emit(this.selectedPage);
  }

  private increase() {
    if (this.selectedPage === this.count - 1) {
      return;
    }

    this.selectPage(this.selectedPage + 1);
  }

  private decrease() {
    if (this.selectedPage === 0) {
      return;
    }

    this.selectPage(this.selectedPage - 1);
  }

  private getPageButton(index: number) {
    return (
      <ix-index-button
        variant="primary"
        onClick={() => {
          this.selectPage(index);
        }}
        selected={this.selectedPage === index}
      >
        {index + 1}
      </ix-index-button>
    );
  }

  private renderPageButtons() {
    const pagesBeforeOverflow = Math.floor(this.maxCountPages / 2);
    const hasOverflow = this.count > this.maxCountPages;
    const hasOverflowStart =
      hasOverflow && this.selectedPage > pagesBeforeOverflow;
    const hasOverflowEnd =
      hasOverflow && this.selectedPage < this.count - pagesBeforeOverflow - 1;
    const pageButtons = [];

    let start = 0;
    let end = Math.min(this.count, this.maxCountPages);
    let pageCount = Math.floor((this.maxCountPages - 4) / 2);

    if (hasOverflowStart) {
      pageButtons.push(this.getPageButton(0));
      pageButtons.push(
        <ix-index-button
          variant="secondary"
          onClick={() => {
            if (hasOverflowEnd) {
              this.selectPage(
                this.selectedPage - Math.max(0, 2 * pageCount + 1)
              );
            } else {
              this.selectPage(this.count - this.maxCountPages);
            }
          }}
        >
          ...
        </ix-index-button>
      );

      if (hasOverflowEnd) {
        start = this.count - this.maxCountPages + 2;
      } else {
        start = this.count - this.maxCountPages + 2;
        end = this.count;
      }
    }

    if (hasOverflowEnd) {
      if (hasOverflowStart) {
        start = this.selectedPage - pageCount;
        end = this.selectedPage + pageCount + 1;
      } else {
        end = this.maxCountPages - 2;
      }
    }

    for (let i = start; i < end; i++) {
      pageButtons.push(this.getPageButton(i));
    }

    if (hasOverflowEnd) {
      pageButtons.push(
        <ix-index-button
          variant="secondary"
          onClick={() => {
            if (hasOverflowStart) {
              this.selectPage(
                this.selectedPage + Math.max(0, 2 * pageCount + 1)
              );
            } else {
              this.selectPage(this.maxCountPages - 1);
            }
          }}
        >
          ...
        </ix-index-button>
      );
      pageButtons.push(this.getPageButton(this.count - 1));
    }

    return <span class="page-buttons">{pageButtons}</span>;
  }

  render() {
    return (
      <Host>
        <ix-icon-button
          disabled={this.selectedPage === 0}
          ghost
          icon="chevron-left-small"
          onClick={() => this.decrease()}
        ></ix-icon-button>

        {this.advanced ? (
          <div class="advanced-pagination">
            {this.i18nPage}
            <input
              class="form-control"
              type="number"
              min="1"
              max={this.count}
              value={this.selectedPage + 1}
              onChange={(e) => {
                const index = Number.parseInt(e.target['value']);
                this.selectPage(index - 1);
              }}
            />
            <span class="total-count">
              {this.i18nOf} {this.count}
            </span>
          </div>
        ) : (
          <span class="basic-pagination">{this.renderPageButtons()} </span>
        )}

        <ix-icon-button
          disabled={this.selectedPage === this.count - 1}
          ghost
          icon="chevron-right-small"
          onClick={() => this.increase()}
        ></ix-icon-button>

        {this.advanced && this.showItemCount ? (
          <span class="item-count">
            {this.i18nItems}
            <ix-select
              hideListHeader
              i18nPlaceholder=""
              i18nSelectListHeader=""
              selected-indices={this.itemCount}
              onItemSelectionChange={(e) => {
                const count = Number.parseInt(e.detail[0]);
                this.itemCountChanged.emit(count);
              }}
            >
              <ix-select-item label="10" value="10"></ix-select-item>
              <ix-select-item label="15" value="15"></ix-select-item>
              <ix-select-item label="20" value="20"></ix-select-item>
              <ix-select-item label="40" value="40"></ix-select-item>
              <ix-select-item label="100" value="100"></ix-select-item>
            </ix-select>
          </span>
        ) : (
          ''
        )}
      </Host>
    );
  }
}
