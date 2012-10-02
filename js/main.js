// Hive Omni ERP
// Copyright (C) 2008-2012 Hive Solutions Lda.
//
// This file is part of Hive Omni ERP.
//
// Hive Omni ERP is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Hive Omni ERP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Hive Omni ERP. If not, see <http://www.gnu.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2012 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3

jQuery(document).ready(function() {
            // retrieves the body
            var _body = jQuery("body");

            // retrieves the filters
            var filter = jQuery(".filter");

            // applies the ui component to the body
            _body.uxapply();

            // FAZER UM PLUGIN PARA SUBSTITUI ESTE CHAMADO TOGGLE VISIBLE
            jQuery(".filter-button").click(function() {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the filter and the filter options
                        var filter = element.parents(".filter");
                        var filterOptions = jQuery(".filter-options", filter);

                        // checks if the filter options is visible
                        var filterOptionsVisible = filterOptions.is(":visible");

                        if (filterOptionsVisible) {
                            filterOptions.hide();
                            element.removeClass("selected");
                        } else {
                            filterOptions.show();
                            element.addClass("selected");
                        }
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(".menu").bind("show", function() {
                        // tenho de apagar o que est actualmente e mostrar o outro
                        // ou fazer push para a stack para depois fazer pop
                        var element = jQuery(this);

                        jQuery(".switch-panel").hide();
                        jQuery(".account-panel").show();

                        // repositions the menu (link)
                        element.uxmenulink("reposition");
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(".switch").click(function() {
                        // tenho de apagar o que est actualmente e mostrar o outro
                        // ou fazer push para a stack para depois fazer pop
                        var element = jQuery(this);
                        var menu = element.parents(".menu");

                        jQuery(".account-panel").hide();
                        jQuery(".switch-panel").show();

                        // repositions the menu (link)
                        menu.uxmenulink("reposition");
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(".back").click(function() {
                        // tenho de apagar o que est actualmente e mostrar o outro
                        // ou fazer push para a stack para depois fazer pop
                        var element = jQuery(this);
                        var menu = element.parents(".menu");

                        jQuery(".account-panel").show();
                        jQuery(".switch-panel").hide();

                        // repositions the menu (link)
                        menu.uxmenulink("reposition");
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(document).bind("scan", function(event, value) {
                        var classUrlMap = {
                            "0001" : "omni_web_sam/consignment_slip/",
                            "0002" : "omni_web_sam/credit_notes/",
                            "0003" : "omni_web_sam/expedition_slips/",
                            "0004" : "omni_web_pum/invoices/",
                            "0005" : "omni_web_sam/invoices/",
                            "0006" : "omni_web_pum/money_sale_slips/",
                            "0007" : "omni_web_sam/money_sale_slips/",
                            "0008" : "omni_web_pum/receipts/",
                            "0009" : "omni_web_sam/receipts/",
                            "0010" : "omni_web_sam/reservation_slips/",
                            "0011" : "omni_web_pum/return_to_vendor_slips/",
                            "0012" : "omni_web_ivm/transportation_slips/",
                            "0013" : "omni_web_sam/till_closes/"
                        }

                        // retrieves the mvc path from the current page
                        var mvcPath = jQuery("#mvc-path").html();

                        // retrieves the version of the barcode then
                        // retrieves the class of the object that is
                        // represented by the barcode and then retrieves
                        // the identifier of the object
                        var version = value.slice(0, 2);
                        var classId = value.slice(2, 6);
                        var objectId = value.slice(6);

                        // constructs the url using the base mvc path and
                        // appending the url to the requested class
                        var baseUrl = mvcPath + classUrlMap[classId];

                        // replaces the left padded zeros in the object
                        // id to contruct the final object id, then uses
                        // it to redirect the user agent to the show page
                        objectId = objectId.replace(/^0+|\s+$/g, "");
                        document.location = baseUrl + objectId;
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(document).bind("scan_error", function(event, value) {
                    });

            // @TODO: had to add this to manipulate windows (better with ux?)
            jQuery(".window-paypal-api-service .button-cancel").click(function() {
                jQuery(".window-paypal-api-service").uxwindow("hide");
            });

            jQuery(".window-paypal-api-service .button-confirm").click(function() {
                        jQuery(".window-paypal-api-service .form").submit();
                        jQuery(".window-paypal-api-service").uxwindow("hide");
                    });

            jQuery(".paypal-api-service-authorize-button").click(function() {
                jQuery(".window-paypal-api-service").uxwindow("show");
            });

            jQuery(".window-easypay-api-service .button-cancel").click(function() {
                jQuery(".window-easypay-api-service").uxwindow("hide");
            });

            jQuery(".window-easypay-api-service .button-confirm").click(function() {
                        jQuery(".window-easypay-api-service .form").submit();
                        jQuery(".window-easypay-api-service").uxwindow("hide");
                    });

            jQuery(".easypay-api-service-authorize-button").click(function() {
                jQuery(".window-easypay-api-service").uxwindow("show");
            });
        });
